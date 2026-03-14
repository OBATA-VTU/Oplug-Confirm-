import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Phone, CreditCard, CheckCircle2, 
  AlertCircle, History, User, Plus, Search, 
  ChevronRight, Bookmark, Trash2, Star, ChevronDown
} from 'lucide-react';
import { vtuService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import PinModal from '../components/PinModal';
import ProcessingModal from '../components/ProcessingModal';

export default function BuyAirtime() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
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
          setServices(response.data.airtime || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  const calculatePrice = (base: number) => {
    if (!prices?.airtime) return base;
    const { markup, resellerDiscount } = prices.airtime;
    const isReseller = profile?.role?.toLowerCase() === 'reseller';
    
    let price = base * (1 + markup / 100);
    if (isReseller) {
      price = price * (1 - resellerDiscount / 100);
    }
    return Math.ceil(price);
  };

  const handlePurchase = async () => {
    if (!selectedService || !amount || !phone) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    const finalAmount = calculatePrice(Number(amount));
    if ((profile?.balance || 0) < finalAmount) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    // Check if PIN is set
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
    setProcessMessage('Processing your airtime purchase...');

    try {
      const finalAmount = calculatePrice(Number(amount));
      const response = await vtuService.buyAirtime({
        serviceID: selectedService,
        amount: Number(amount),
        mobileNumber: phone
      });

      if (response.status === 'success') {
        setProcessStatus('success');
        setProcessMessage(response.message || 'Airtime purchase successful!');
        
        // Record transaction
        if (user) {
          const isReseller = profile?.role?.toLowerCase() === 'reseller';
          const baseAmount = Number(amount);
          const markup = prices?.airtime?.markup || 0;
          const standardPrice = Math.ceil(baseAmount * (1 + markup / 100));
          const profit = isReseller ? (standardPrice - finalAmount) : 0;

          const network = services.find(s => s.serviceID === selectedService)?.network || selectedService;
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            type: 'Airtime Purchase',
            amount: finalAmount,
            profit: profit,
            status: 'success',
            description: `${network.toUpperCase()} ₦${amount} Airtime to ${phone}`,
            reference: response.reference || `AIRTIME-${Date.now()}`,
            createdAt: serverTimestamp(),
            service: 'airtime'
          });

          // Deduct from local balance
          await updateDoc(doc(db, 'users', user.uid), {
            balance: increment(-finalAmount)
          });
        }

        // Save beneficiary if checked
        if (saveBeneficiary && beneficiaryName && user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            airtimeBeneficiaries: arrayUnion({
              name: beneficiaryName,
              phone: phone,
              network: selectedService,
              id: Date.now().toString()
            })
          });
        }

        setAmount('');
        setPhone('');
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
    setPhone(b.phone);
    setSelectedService(b.network);
    setShowBeneficiaries(false);
  };

  const deleteBeneficiary = async (b: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        airtimeBeneficiaries: arrayRemove(b)
      });
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Buy Airtime</h1>
          <p className="text-gray-500 font-medium">Top up your line instantly with Oplug.</p>
        </div>
        <button 
          onClick={() => setShowBeneficiaries(!showBeneficiaries)}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <Bookmark className="w-4 h-4 text-blue-600" />
          {showBeneficiaries ? 'Hide Beneficiaries' : 'Saved Beneficiaries'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
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
              {/* Network Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Network</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-10 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose a network provider</option>
                    {services.map((s, index) => (
                      <option key={`${s.serviceID}-${index}`} value={s.serviceID}>
                        {s.network.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Amount & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount (₦)</label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="number"
                      placeholder="eg: 500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-gray-400 flex justify-between px-2">
                    <span>You will be charged: ₦{calculatePrice(Number(amount) || 0)}</span>
                    <span>Balance: ₦{profile?.balance?.toLocaleString() || '0.00'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel"
                      placeholder="eg: 08123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

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
                        placeholder="eg: My Main Line"
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
                disabled={loading}
                className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Purchase Airtime
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Side Info / Beneficiaries */}
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
                {profile?.airtimeBeneficiaries?.length > 0 ? (
                  profile.airtimeBeneficiaries.map((b: any) => (
                    <div 
                      key={b.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group cursor-pointer"
                      onClick={() => selectBeneficiary(b)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Smartphone className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{b.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{b.phone}</p>
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
                    <p className="text-xs font-bold">No beneficiaries saved yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-4">Midas Touch</h3>
                <p className="text-sm text-blue-100 leading-relaxed mb-6">
                  Every transaction on Oplug is instant. We use direct connections to all major networks to ensure you get your airtime in seconds.
                </p>
                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Last Purchase</p>
                    <p className="text-sm font-black">MTN ₦500</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-500 mb-6">If you encounter any issues with your purchase, our support team is available 24/7.</p>
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
        description={`Enter your 5-digit PIN to authorize ₦${amount} airtime purchase for ${phone}`}
      />

      {/* Setup PIN Modal (if not set) */}
      <PinModal 
        isOpen={showSetupPinModal}
        onClose={() => setShowSetupPinModal(false)}
        onSuccess={() => navigate('/profile')}
        mode="verify" // We use verify mode but it's actually a redirect to setup
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
