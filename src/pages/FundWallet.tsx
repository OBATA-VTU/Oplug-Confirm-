import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Landmark, Copy, CheckCircle2, Upload, ArrowRight, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { fundingService } from '../services/apiService';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { cn } from '../lib/utils';
import axios from 'axios';

export default function FundWallet() {
  const { profile, user } = useAuth();
  const [method, setMethod] = useState<'virtual' | 'paystack' | 'manual'>('virtual');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFirstDeposit, setIsFirstDeposit] = useState(false);
  
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
        throw new Error('ImgBB API Key is missing');
      }

      const uploadRes = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      const downloadURL = uploadRes.data.data.url;

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
    } catch (err) {
      setError('Failed to submit proof. Please try again.');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Fund Your Wallet</h2>
          {isFirstDeposit && (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border border-emerald-100 animate-pulse">
              <Zap className="w-4 h-4" />
              FIRST DEPOSIT IS FREE!
            </div>
          )}
        </div>

        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 mb-8">
          <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Funding Charges Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/50 p-3 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Virtual Account</p>
              <p className="text-sm font-bold text-blue-900">0.7% Fee</p>
            </div>
            <div className="bg-white/50 p-3 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Paystack (ATM)</p>
              <p className="text-sm font-bold text-blue-900">₦25 Flat Fee</p>
            </div>
            <div className="bg-white/50 p-3 rounded-2xl border border-blue-100">
              <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">Manual Payment</p>
              <p className="text-sm font-bold text-blue-900">FREE (No Fee)</p>
            </div>
          </div>
          {isFirstDeposit && (
            <p className="text-xs text-emerald-700 font-bold mt-4 bg-emerald-100/50 p-3 rounded-xl border border-emerald-200">
              💡 Pro Tip: Since your first deposit is completely FREE, we encourage you to fund a large amount to maximize this one-time opportunity!
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'virtual', label: 'Virtual Account', icon: Landmark },
            { id: 'paystack', label: 'ATM Card', icon: CreditCard },
            { id: 'manual', label: 'Manual Funding', icon: Wallet },
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setMethod(item.id as any)}
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold transition-all whitespace-nowrap",
                method === item.id 
                  ? "bg-blue-700 text-white shadow-xl shadow-blue-100" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl border border-emerald-100 mb-6">
            {success}
          </div>
        )}

        <AnimatePresence mode="wait">
          {method === 'virtual' && (
            <motion.div 
              key="virtual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile?.virtualAccount ? (
                  <div className="bg-gray-900 text-white rounded-[2rem] p-8 relative overflow-hidden group col-span-full md:col-span-1">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">Bank Name</p>
                          <p className="text-xl font-bold">{profile.virtualAccount.bank_name}</p>
                        </div>
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <Landmark className="w-5 h-5" />
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">Account Number</p>
                        <div className="flex items-center gap-3">
                          <p className="text-3xl font-mono font-bold tracking-wider">{profile.virtualAccount.account_number}</p>
                          <button 
                            onClick={() => handleCopy(profile.virtualAccount.account_number)}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] opacity-60 uppercase tracking-widest mb-1">Account Name</p>
                        <p className="text-lg font-bold">{profile.virtualAccount.account_name}</p>
                      </div>
                    </div>
                    <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/30 transition-all" />
                  </div>
                ) : (
                  <div className="col-span-full p-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 font-bold">No virtual accounts generated yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Please complete your profile setup to get your permanent accounts.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {method === 'paystack' && (
            <motion.div 
              key="paystack"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-md mx-auto"
            >
              <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100">
                <p className="text-sm text-purple-700">
                  Fund your wallet instantly using your ATM Card, USSD, or Bank Transfer via Paystack.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Amount to Fund (₦)</label>
                  <input 
                    type="number"
                    placeholder="eg: 2000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button 
                  onClick={handlePaystack}
                  disabled={loading}
                  className="w-full bg-blue-700 text-white font-bold py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Initializing...' : (
                    <>
                      Pay with Paystack
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {method === 'manual' && (
            <motion.div 
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <p className="text-sm text-amber-700">
                  Transfer to the account below and upload your proof of payment for manual verification.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 space-y-6">
                  <h3 className="font-bold text-lg">Bank Details</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Bank Name</p>
                      <p className="text-xl font-bold text-blue-700">PALMPAY</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Account Number</p>
                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-mono font-bold">8142452729</p>
                        <button 
                          onClick={() => handleCopy('8142452729')}
                          className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          <Copy className="w-4 h-4 text-blue-700" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Account Name</p>
                      <p className="text-lg font-bold uppercase">BOLUWATIFE OLUWAPELUMI AYUBA</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-bold text-lg">Upload Proof</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Amount Paid (₦)</label>
                      <input 
                        type="number" 
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="Enter amount paid"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Screenshot of Payment</label>
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
                          className="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                        >
                          {proofPreview ? (
                            <img src={proofPreview} className="w-full h-full object-cover" alt="Proof Preview" />
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500 font-bold">Click to upload screenshot</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>

                    <button 
                      onClick={handleManualSubmit}
                      disabled={loading}
                      className="w-full bg-blue-700 text-white font-bold py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
                    >
                      {loading ? 'Submitting...' : 'Submit Proof of Payment'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
