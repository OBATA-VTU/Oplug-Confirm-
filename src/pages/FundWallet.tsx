import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wallet, CreditCard, Landmark, Copy, CheckCircle2, Upload, ArrowRight, Info, Zap, ChevronRight, ShieldCheck, Banknote, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { fundingService } from '../services/apiService';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function FundWallet() {
  const { profile, user } = useAuth();
  const location = useLocation();
  const [method, setMethod] = useState<'virtual' | 'paystack' | 'manual' | 'dynamic'>('virtual');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFirstDeposit, setIsFirstDeposit] = useState(false);
  
  // Dynamic Account State
  const [dynamicAccount, setDynamicAccount] = useState<{
    account_number: string;
    bank_name: string;
    account_name: string;
    expires_at: string;
    reference: string;
  } | null>(null);

  useEffect(() => {
    if (location.state?.amount) {
      setAmount(location.state.amount.toString());
      setMethod('paystack'); // Default to paystack if coming from upgrade
    }
  }, [location.state]);
  
  // Manual Payment State
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [manualAmount, setManualAmount] = useState('');

  useEffect(() => {
    const checkFirstDeposit = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'transactions'), 
          where('userId', '==', user.uid),
          where('type', '==', 'funding'),
          where('status', '==', 'success'),
          limit(1)
        );
        const snap = await getDocs(q);
        setIsFirstDeposit(snap.empty);
      } catch (err) {
        console.error('Error checking first deposit:', err);
      }
    };
    checkFirstDeposit();
  }, [user]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProof(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleManualSubmit = async () => {
    if (!proof || !manualAmount) {
      setError('Please provide amount and proof of payment');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', proof);
      
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error('ImgBB API Key is missing. Please set VITE_IMGBB_API_KEY in your environment.');
      }

      console.log('Uploading to ImgBB...');
      const uploadRes = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      
      if (!uploadRes.data || !uploadRes.data.data || !uploadRes.data.data.url) {
        throw new Error('Invalid response from ImgBB');
      }

      const downloadURL = uploadRes.data.data.url;
      console.log('Upload successful:', downloadURL);

      await addDoc(collection(db, 'manual_payments'), {
        userId: user?.uid,
        userEmail: user?.email,
        amount: Number(manualAmount),
        proofUrl: downloadURL,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setSuccess('Payment proof submitted successfully! Your wallet will be funded once verified.');
      setProof(null);
      setProofPreview(null);
      setManualAmount('');
    } catch (err: any) {
      console.error('Manual funding error:', err);
      setError(err.message || 'Failed to submit proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaystack = async () => {
    if (!amount || Number(amount) < 100) {
      setError('Minimum funding amount is ₦100');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fundingService.initializePaystack({
        email: profile?.email || '',
        amount: Number(amount),
        reference: `FUND_${user?.uid}_${Date.now()}`
      });

      if (res.status) {
        window.location.href = res.data.authorization_url;
      } else {
        setError(res.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicAccount = async () => {
    if (!amount || Number(amount) < 100) {
      setError('Minimum funding amount is ₦100');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const reference = `FUND_DYN_${user?.uid}_${Date.now()}`;
      const res = await fundingService.initializeDynamicAccount({
        email: profile?.email || '',
        amount: Number(amount),
        reference
      });

      if (res.status && res.data.status === 'send_address') {
        const transferData = res.data.data;
        setDynamicAccount({
          account_number: transferData.account_number,
          bank_name: transferData.bank_name,
          account_name: 'Paystack / Oplug', // Usually Paystack generates a generic name or includes merchant
          expires_at: new Date(Date.now() + 30 * 60000).toISOString(), // Paystack usually gives 30 mins
          reference
        });
      } else {
        setError(res.message || 'Failed to generate dynamic account. Please try another method.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    setLoading(true);
    // In a real app, you'd call an endpoint to verify the reference
    // For now, we'll just show a message
    setTimeout(() => {
      setSuccess('We are verifying your payment. Your wallet will be credited once confirmed.');
      setLoading(false);
    }, 2000);
  };

  const methods = [
    { id: 'virtual', label: 'Virtual Account', icon: Landmark, description: 'Automated & Instant', color: 'bg-blue-50 text-blue-700' },
    { id: 'dynamic', label: 'Dynamic Account', icon: RefreshCw, description: 'One-time Transfer', color: 'bg-emerald-50 text-emerald-700' },
    { id: 'paystack', label: 'ATM Card', icon: CreditCard, description: 'Pay via Paystack', color: 'bg-purple-50 text-purple-700' },
    { id: 'manual', label: 'Manual Funding', icon: Banknote, description: 'Zero Fees', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Fund Wallet</h1>
          <p className="text-gray-500 font-medium">
            {location.state?.reason ? `Funding for ${location.state.reason}` : 'Choose your preferred funding method.'}
          </p>
        </div>
        {isFirstDeposit && (
          <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl text-xs font-black flex items-center gap-2 border border-emerald-100 shadow-sm">
            <Zap className="w-5 h-5" />
            FIRST DEPOSIT IS FREE!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Method Selection */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Select Method</h3>
          <div className="space-y-3">
            {methods.map((item) => (
              <button 
                key={item.id}
                onClick={() => setMethod(item.id as any)}
                className={cn(
                  "w-full flex items-center justify-between p-5 rounded-[2rem] transition-all border group",
                  method === item.id 
                    ? "bg-white border-blue-500 shadow-xl shadow-blue-500/5" 
                    : "bg-white border-gray-100 hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black text-gray-900">{item.label}</p>
                    <p className="text-[10px] font-bold text-gray-400">{item.description}</p>
                  </div>
                </div>
                {method === item.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
              </button>
            ))}
          </div>

          <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100">
            <h4 className="text-xs font-black text-blue-900 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Fee Structure
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-blue-700">
                <span>Virtual Account</span>
                <span>0.7%</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-blue-700">
                <span>ATM Card</span>
                <span>₦25 Flat</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-blue-700">
                <span>Dynamic Account</span>
                <span>₦25 Flat</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-blue-700">
                <span>Manual</span>
                <span>FREE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100 min-h-[500px]">
            {error && (
              <div className="p-5 bg-red-50 text-red-700 text-sm font-bold rounded-2xl border border-red-100 mb-8 flex items-center gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-5 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl border border-emerald-100 mb-8 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5" />
                {success}
              </div>
            )}

            <AnimatePresence mode="wait">
              {method === 'virtual' && (
                <motion.div 
                  key="virtual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-2 mb-10">
                    <h3 className="text-2xl font-black text-gray-900">Automated Funding</h3>
                    <p className="text-sm text-gray-500 font-medium">Transfer to any of your accounts below for instant funding.</p>
                  </div>

                  {profile?.virtualAccount ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-12">
                            <div>
                              <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mb-1 font-black">Bank Provider</p>
                              <p className="text-2xl font-black tracking-tight">{profile.virtualAccount.bank_name}</p>
                            </div>
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                              <Landmark className="w-7 h-7" />
                            </div>
                          </div>
                          
                          <div className="mb-12">
                            <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mb-2 font-black">Account Number</p>
                            <div className="flex items-center gap-4">
                              <p className="text-4xl font-black tracking-[0.1em]">{profile.virtualAccount.account_number}</p>
                              <button 
                                onClick={() => handleCopy(profile.virtualAccount!.account_number)}
                                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-90"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mb-1 font-black">Account Name</p>
                              <p className="text-lg font-black uppercase tracking-tight">{profile.virtualAccount.account_name}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
                              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Active</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Card Decoration */}
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />
                      </div>

                      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 flex items-start gap-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs text-amber-900 font-bold leading-relaxed">
                          Funds sent to this account are automatically credited to your Oplug wallet within 1-3 minutes. A service fee of 0.7% applies.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                      <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center">
                        <ShieldCheck className="w-12 h-12 text-gray-200" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-900">Account Not Generated</p>
                        <p className="text-sm text-gray-500 max-w-xs mx-auto">Please ensure your profile is complete to get your automated funding accounts.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {method === 'dynamic' && (
                <motion.div 
                  key="dynamic"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  {!dynamicAccount ? (
                    <div className="max-w-md mx-auto space-y-8">
                      <div className="text-center space-y-2 mb-10">
                        <h3 className="text-2xl font-black text-gray-900">Dynamic Account</h3>
                        <p className="text-sm text-gray-500 font-medium">Get a one-time account number for this payment.</p>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Amount to Fund (₦)</label>
                          <div className="relative">
                            <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                            <input 
                              type="number"
                              placeholder="Min: 100"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-14 pr-6 py-6 text-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center gap-4">
                          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <RefreshCw className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-xs text-emerald-900 font-bold">
                            A one-time account will be generated. Do not save it for future use.
                          </p>
                        </div>

                        <button 
                          onClick={handleDynamicAccount}
                          disabled={loading}
                          className="w-full bg-emerald-600 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-emerald-200 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                          {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              Generate Account
                              <ArrowRight className="w-6 h-6" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black text-gray-900">Transfer Details</h3>
                        <p className="text-sm text-gray-500 font-medium">Please make a transfer of <span className="text-blue-600 font-black">₦{amount}</span> to the account below.</p>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 space-y-8">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mb-1 font-black">Bank Name</p>
                              <p className="text-2xl font-black tracking-tight">{dynamicAccount.bank_name}</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                              <Clock className="w-4 h-4 text-emerald-300" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Expires in 30m</span>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mb-2 font-black">Account Number</p>
                            <div className="flex items-center gap-4">
                              <p className="text-4xl font-black tracking-[0.1em]">{dynamicAccount.account_number}</p>
                              <button 
                                onClick={() => handleCopy(dynamicAccount.account_number)}
                                className="p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-90"
                              >
                                <Copy className="w-5 h-5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-[10px] opacity-50 uppercase tracking-[0.2em] mb-1 font-black">Account Name</p>
                              <p className="text-lg font-black uppercase tracking-tight">{dynamicAccount.account_name}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
                      </div>

                      <div className="bg-red-50 rounded-3xl p-6 border border-red-100 flex items-start gap-4">
                        <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-red-900 font-black uppercase tracking-wider">Warning: Single Use Only</p>
                          <p className="text-[10px] text-red-700 font-bold leading-relaxed">
                            This account number is for a one-time transfer only. Do not save it for future payments. Oplug is not liable for losses incurred from saving this account.
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={checkPaymentStatus}
                        disabled={loading}
                        className="w-full bg-gray-900 text-white font-black py-6 rounded-[2rem] shadow-2xl hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            I have made payment
                            <CheckCircle2 className="w-6 h-6" />
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => setDynamicAccount(null)}
                        className="w-full text-gray-400 text-xs font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
                      >
                        Cancel & Try Another Method
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {method === 'paystack' && (
                <motion.div 
                  key="paystack"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 max-w-md mx-auto"
                >
                  <div className="text-center space-y-2 mb-10">
                    <h3 className="text-2xl font-black text-gray-900">Card Funding</h3>
                    <p className="text-sm text-gray-500 font-medium">Pay securely with your ATM card via Paystack.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Amount to Fund (₦)</label>
                      <div className="relative">
                        <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                        <input 
                          type="number"
                          placeholder="Min: 100"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-14 pr-6 py-6 text-2xl font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-xs text-purple-900 font-bold">
                        A flat fee of ₦25 applies to all card transactions. Securely processed by Paystack.
                      </p>
                    </div>

                    <button 
                      onClick={handlePaystack}
                      disabled={loading}
                      className="w-full bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-blue-200 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Proceed to Payment
                          <ArrowRight className="w-6 h-6" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {method === 'manual' && (
                <motion.div 
                  key="manual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="text-center space-y-2 mb-6">
                    <h3 className="text-2xl font-black text-gray-900">Manual Funding</h3>
                    <p className="text-sm text-gray-500 font-medium">Transfer to our bank and upload proof. Zero fees.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Bank Name</p>
                          <p className="text-xl font-black text-blue-700">PALMPAY</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Number</p>
                          <div className="flex items-center gap-3">
                            <p className="text-3xl font-black tracking-wider text-gray-900">8142452729</p>
                            <button 
                              onClick={() => handleCopy('8142452729')}
                              className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-100 transition-all"
                            >
                              <Copy className="w-4 h-4 text-blue-700" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Name</p>
                          <p className="text-sm font-black text-gray-900 uppercase leading-relaxed">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Amount Paid</label>
                        <input 
                          type="number" 
                          value={manualAmount}
                          onChange={(e) => setManualAmount(e.target.value)}
                          placeholder="₦ 0.00"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg font-black focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Payment Receipt</label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="proof-upload"
                          />
                          <label 
                            htmlFor="proof-upload"
                            className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden"
                          >
                            {proofPreview ? (
                              <img src={proofPreview} className="w-full h-full object-cover" alt="Proof Preview" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-gray-300 mb-2" />
                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Upload Screenshot</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>

                      <button 
                        onClick={handleManualSubmit}
                        disabled={loading}
                        className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {loading ? 'Submitting...' : 'Submit Proof'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
