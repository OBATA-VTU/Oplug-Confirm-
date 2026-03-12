import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Wifi, Smartphone, CreditCard, CheckCircle2, 
  AlertCircle, History, User, Plus, Search, 
  ChevronRight, Bookmark, Trash2, Star, Info, Phone
} from 'lucide-react';
import { vtuService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';
import PinModal from '../components/PinModal';
import ProcessingModal from '../components/ProcessingModal';

export default function BuyData() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<any[]>([]);
  const [network, setNetwork] = useState('');
  const [type, setType] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.dataPlans || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (network) {
      const plans = services.filter(p => p.network.toLowerCase() === network.toLowerCase());
      const uniqueTypes = Array.from(new Set(plans.map(p => p.dataType)));
      if (type && !uniqueTypes.includes(type)) {
        setType('');
      }
      
      let finalPlans = plans;
      if (type) {
        finalPlans = plans.filter(p => p.dataType === type);
      }
      setFilteredPlans(finalPlans);
    } else {
      setFilteredPlans([]);
    }
  }, [network, type, services]);

  const handlePurchase = async () => {
    if (!selectedPlan || !phone) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
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

    try {
      const response = await vtuService.buyData({
        serviceID: selectedPlan,
        mobileNumber: phone
      });

      if (response.status === 'success') {
        setProcessStatus('success');
        setProcessMessage(response.message);
        
        // Record transaction
        if (user) {
          const plan = services.find(p => p.serviceID === selectedPlan);
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            type: 'Data Purchase',
            amount: plan?.amount || 0,
            status: 'success',
            description: `${network.toUpperCase()} ${plan?.dataPlan} to ${phone}`,
            reference: response.reference || `DATA-${Date.now()}`,
            createdAt: serverTimestamp()
          });

          // Update user balance (in a real app, the backend would do this via webhook or direct write)
          // For this demo, we'll assume the balance is updated on the server and we just need to refresh or wait
        }

        if (saveBeneficiary && beneficiaryName && user) {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            dataBeneficiaries: arrayUnion({
              name: beneficiaryName,
              phone: phone,
              network: network,
              id: Date.now().toString()
            })
          });
        }

        setPhone('');
        setBeneficiaryName('');
        setSaveBeneficiary(false);
      } else {
        setProcessStatus('error');
        setProcessMessage(response.message || 'Transaction failed');
      }
    } catch (error: any) {
      setProcessStatus('error');
      setProcessMessage(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectBeneficiary = (b: any) => {
    setPhone(b.phone);
    setNetwork(b.network);
    setShowBeneficiaries(false);
  };

  const deleteBeneficiary = async (b: any) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        dataBeneficiaries: arrayRemove(b)
      });
    } catch (err) {
      console.error('Error deleting beneficiary:', err);
    }
  };

  const networks = Array.from(new Set(services.map(s => s.network)));
  const types = network ? Array.from(new Set(services.filter(s => s.network.toLowerCase() === network.toLowerCase()).map(s => s.dataType))) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Buy Data</h1>
          <p className="text-gray-500 font-medium">High-speed internet at your fingertips.</p>
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex gap-4">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-xs font-medium leading-relaxed">
              <span className="font-black uppercase tracking-wider">Important:</span> Please, don't send Airtel Awoof and Gifting to any number owing Airtel. It will not deliver and you will not be refunded.
            </p>
          </div>

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
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Network</label>
                <select 
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select Network Provider</option>
                  {networks.map((n: any) => (
                    <option key={n} value={n}>{(n as string).toUpperCase()}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Data Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    <option value="">Select Type</option>
                    {types.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
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

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Plan</label>
                <select 
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select Plan</option>
                  {filteredPlans.map(p => (
                    <option key={p.serviceID} value={p.serviceID}>{p.dataPlan} - ₦{p.amount} ({p.validity})</option>
                  ))}
                </select>
              </div>

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
                    <Wifi className="w-5 h-5" />
                    Purchase Data
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
                {profile?.dataBeneficiaries?.length > 0 ? (
                  profile.dataBeneficiaries.map((b: any) => (
                    <div 
                      key={b.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group cursor-pointer"
                      onClick={() => selectBeneficiary(b)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <Wifi className="w-5 h-5 text-blue-600" />
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
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-700" />
                Balance Codes
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'MTN [SME]', code: '*461*4#' },
                  { label: 'MTN [Corp]', code: '*460*260#' },
                  { label: 'MTN [Gift]', code: '*323#' },
                  { label: '9mobile', code: '*323#' },
                  { label: 'Airtel', code: '*323#' },
                  { label: 'Glo', code: '*323#' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-bold text-gray-500">{item.label}</span>
                    <span className="text-xs font-black text-blue-700">{item.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Fast & Reliable</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Experience blazing fast data delivery. Our systems are optimized for speed and reliability across all networks.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
      
      <PinModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={executePurchase}
        correctPin={profile?.transactionPin}
        mode="verify"
      />

      <PinModal 
        isOpen={showSetupPinModal}
        onClose={() => setShowSetupPinModal(false)}
        onSuccess={() => navigate('/profile')} // Redirect to profile to set PIN
        mode="setup"
        title="Setup Transaction PIN"
        description="You need to set a transaction PIN before you can make purchases. Go to your profile to set it up."
      />

      <ProcessingModal 
        isOpen={showProcessing}
        status={processStatus}
        message={processMessage}
        onClose={() => setShowProcessing(false)}
      />
    </div>
  );
}
