import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Smartphone, Phone, CreditCard, CheckCircle2, 
  AlertCircle, History, User, Plus, Search, 
  ChevronRight, Bookmark, Trash2, Star
} from 'lucide-react';
import { vtuService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function BuyAirtime() {
  const { user, profile } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);

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

  const handlePurchase = async () => {
    if (!selectedService || !amount || !phone) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await vtuService.buyAirtime({
        serviceID: selectedService,
        amount: Number(amount),
        mobileNumber: phone
      });

      if (response.status === 'success') {
        setMessage({ type: 'success', text: response.message });
        
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
        setMessage({ type: 'error', text: response.message || 'Transaction failed' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'An error occurred' });
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {services.map((s) => (
                    <button
                      key={s.serviceID}
                      onClick={() => setSelectedService(s.serviceID)}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all group",
                        selectedService === s.serviceID 
                          ? "border-blue-700 bg-blue-50/50" 
                          : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                        selectedService === s.serviceID ? "bg-blue-700 text-white" : "bg-white text-gray-400"
                      )}>
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        selectedService === s.serviceID ? "text-blue-700" : "text-gray-400"
                      )}>{s.network}</span>
                    </button>
                  ))}
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
    </div>
  );
}
