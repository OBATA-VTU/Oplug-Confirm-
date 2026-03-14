import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Tv, Monitor, CreditCard, CheckCircle2, 
  AlertCircle, History, User, Plus, Search, 
  ChevronRight, Bookmark, Trash2, Star, ShieldCheck, ChevronDown
} from 'lucide-react';
import { vtuService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';
import ProcessingModal from '../components/ProcessingModal';

export default function CableSubscription() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [cable, setCable] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [iuc, setIuc] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  const [prices, setPrices] = useState<any>(null);

  // PIN & Processing states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'prices'));
        if (snap.exists()) {
          setPrices(snap.data());
        }
      } catch (err) {
        console.error('Error fetching prices:', err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.cablePlans || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  const calculatePrice = (base: number) => {
    if (!prices?.cable) return base;
    const { markup, resellerDiscount } = prices.cable;
    const isReseller = profile?.role?.toLowerCase() === 'reseller';
    
    let price = base * (1 + markup / 100);
    if (isReseller) {
      price = price * (1 - resellerDiscount / 100);
    }
    return Math.ceil(price);
  };

  useEffect(() => {
    if (cable) {
      const plans = services.filter(p => p.cable.toLowerCase() === cable.toLowerCase());
      
      // Apply dynamic pricing
      const pricedPlans = plans.map(p => ({
        ...p,
        displayAmount: calculatePrice(Number(p.amount))
      }));
      
      setFilteredPlans(pricedPlans);
    } else {
      setFilteredPlans([]);
    }
  }, [cable, services, prices, profile?.role]);

  const handleValidate = async () => {
    if (!selectedPlan || !iuc) {
      setMessage({ type: 'error', text: 'Please select a plan and enter IUC number' });
      return;
    }

    setValidating(true);
    setMessage({ type: '', text: '' });
    setCustomerName('');

    try {
      const response = await vtuService.validateCable({
        serviceID: selectedPlan,
        iucNum: iuc
      });

      if (response.status === 'success') {
        setCustomerName(response.data.customerName);
        setMessage({ type: 'success', text: `Customer: ${response.data.customerName}` });
      } else {
        setMessage({ type: 'error', text: response.message || 'Validation failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
    } finally {
      setValidating(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !iuc) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    const plan = filteredPlans.find(p => p.serviceID === selectedPlan);
    if (plan && (profile?.balance || 0) < plan.displayAmount) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    if (!profile?.isPinSet) {
      setShowSetupPinModal(true);
      return;
    }

    setShowPinModal(true);
  };

  const executePurchase = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    setShowProcessing(true);
    setProcessStatus('processing');
    setProcessMessage('Processing your cable subscription...');

    try {
      const plan = filteredPlans.find(p => p.serviceID === selectedPlan);
      const response = await vtuService.buyCable({
        serviceID: selectedPlan,
        iucNum: iuc
      });

      if (response.status === 'success') {
        setProcessStatus('success');
        setProcessMessage(response.message || 'Subscription successful!');
        
        // Record transaction
        if (user) {
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            type: 'Cable Subscription',
            amount: plan?.displayAmount || 0,
            status: 'success',
            description: `${(cable as string).toUpperCase()} ${plan?.cablePlan} to ${iuc} (${customerName})`,
            reference: response.reference || `CABLE-${Date.now()}`,
            createdAt: serverTimestamp()
          });

          // Deduct from local balance
          await updateDoc(doc(db, 'users', user.uid), {
            balance: increment(-(plan?.displayAmount || 0))
          });
        }

        // Save beneficiary if checked
        if (saveBeneficiary && beneficiaryName && user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            cableBeneficiaries: arrayUnion({
              name: beneficiaryName,
              iuc: iuc,
              cable: cable,
              id: Date.now().toString()
            })
          });
        }

        setIuc('');
        setCustomerName('');
        setBeneficiaryName('');
        setSaveBeneficiary(false);
      } else {
        setProcessStatus('error');
        setProcessMessage(response.message || 'Transaction failed');
      }
    } catch (error: any) {
      setProcessStatus('error');
      setProcessMessage(error.response?.data?.message || 'An error occurred during transaction');
    } finally {
      setLoading(false);
    }
  };

  const selectBeneficiary = (b: any) => {
    setIuc(b.iuc);
    setCable(b.cable);
    setShowBeneficiaries(false);
  };

  const deleteBeneficiary = async (b: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        cableBeneficiaries: arrayRemove(b)
      });
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
    }
  };

  const cables = Array.from(new Set(services.map(s => s.cable)));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Cable TV</h1>
          <p className="text-gray-500 font-medium">Renew your TV subscription instantly.</p>
        </div>
        <button 
          onClick={() => setShowBeneficiaries(!showBeneficiaries)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Bookmark className="w-4 h-4 text-blue-600" />
          {showBeneficiaries ? 'Hide Saved' : 'Saved IUCs'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-5 rounded-2xl mb-8 flex items-start gap-3",
                  message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm font-bold">{message.text}</p>
              </motion.div>
            )}

            <div className="space-y-8">
              {/* Cable Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Provider</label>
                <div className="relative">
                  <Tv className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    value={cable}
                    onChange={(e) => setCable(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose a cable provider</option>
                    {cables.map((c: string) => (
                      <option key={c} value={c}>
                        {c.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Plan</label>
                <div className="relative">
                  <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select 
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="">Select a plan</option>
                    {filteredPlans.map((p, index) => (
                      <option key={`${p.serviceID}-${index}`} value={p.serviceID}>{p.cablePlan} - ₦{p.displayAmount}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* IUC Number */}
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">IUC / SmartCard Number</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="eg: 7027914329"
                      value={iuc}
                      onChange={(e) => setIuc(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleValidate}
                    disabled={validating || !iuc || !selectedPlan}
                    className="px-6 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                  >
                    {validating ? '...' : 'Verify'}
                  </button>
                </div>
              </div>

              {customerName && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4"
                >
                  <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Customer Name</p>
                    <p className="text-sm font-black text-blue-900">{customerName}</p>
                  </div>
                </motion.div>
              )}

              {/* Save Beneficiary */}
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div 
                    onClick={() => setSaveBeneficiary(!saveBeneficiary)}
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                      saveBeneficiary ? "bg-blue-700 border-blue-700" : "border-gray-200 group-hover:border-blue-700"
                    )}
                  >
                    {saveBeneficiary && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-sm font-bold text-gray-600">Save as beneficiary</span>
                </label>

                {saveBeneficiary && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Beneficiary Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="eg: Living Room TV"
                        value={beneficiaryName}
                        onChange={(e) => setBeneficiaryName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <button 
                onClick={handlePurchase}
                disabled={loading || !customerName}
                className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Tv className="w-5 h-5" />
                    Subscribe Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {showBeneficiaries ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
            >
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Saved
              </h3>
              <div className="space-y-4">
                {profile?.cableBeneficiaries?.length > 0 ? (
                  profile.cableBeneficiaries.map((b: any) => (
                    <div 
                      key={b.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group cursor-pointer"
                      onClick={() => selectBeneficiary(b)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Tv className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{b.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{b.iuc} ({b.cable})</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBeneficiary(b);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-bold">No saved IUCs yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-gray-200">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Entertainment</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Don't miss out on your favorite shows. Renew your DStv, GOtv, or Startimes subscription in seconds.
                </p>
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl backdrop-blur-md border border-white/5">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Secure Payment</p>
                    <p className="text-sm font-black">Verified Transaction</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-700/20 rounded-full blur-2xl" />
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-500 mb-6">If your subscription doesn't reflect after payment, please contact our support team.</p>
            <Link to="/support" className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 rounded-2xl text-sm font-black text-gray-600 hover:bg-gray-100 transition-all">
              Contact Support
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* PIN Verification Modal */}
      <PinModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={executePurchase}
        correctPin={profile?.transactionPin}
        mode="verify"
        title="Verify Transaction"
        description={`Enter your 5-digit PIN to authorize cable subscription for ${iuc}`}
      />

      {/* Setup PIN Modal */}
      <PinModal 
        isOpen={showSetupPinModal}
        onClose={() => setShowSetupPinModal(false)}
        onSuccess={() => navigate('/profile')}
        mode="verify"
        title="PIN Required"
        description="You need to set a transaction PIN before you can make purchases. Would you like to set it now?"
      />

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={showProcessing}
        onClose={() => setShowProcessing(false)}
        status={processStatus}
        message={processMessage}
      />
    </div>
  );
}
