import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Wallet,
  CreditCard,
  Star,
  TrendingUp,
  Percent,
  Headphones
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, increment, runTransaction } from 'firebase/firestore';
import { cn } from '../lib/utils';
import ProcessingModal from '../components/ProcessingModal';

export default function Upgrade() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<any>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');

  const UPGRADE_FEE = 1200;

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

  const handleUpgrade = async () => {
    if (!user || !profile) return;

    if (profile.role === 'reseller') {
      setProcessStatus('error');
      setProcessMessage('You are already a reseller!');
      setShowProcessing(true);
      return;
    }

    if (profile.balance < UPGRADE_FEE) {
      // Redirect to fund wallet with the required amount
      navigate('/fund', { state: { amount: UPGRADE_FEE - profile.balance, reason: 'Account Upgrade' } });
      return;
    }

    setLoading(true);
    setShowProcessing(true);
    setProcessStatus('processing');

    try {
      const userRef = doc(db, 'users', user.uid);
      
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw new Error("User document does not exist!");
        }

        const userData = userDoc.data();
        const currentBalance = userData.balance || 0;

        if (currentBalance < UPGRADE_FEE) {
          throw new Error("Insufficient balance for upgrade");
        }

        transaction.update(userRef, {
          balance: increment(-UPGRADE_FEE),
          role: 'reseller'
        });

        // Record transaction
        const transRef = doc(collection(db, 'transactions'));
        transaction.set(transRef, {
          userId: user.uid,
          type: 'Account Upgrade',
          amount: UPGRADE_FEE,
          status: 'success',
          description: 'Upgrade to Reseller Account',
          reference: `UPG-${Date.now()}`,
          createdAt: serverTimestamp()
        });
      });

      setProcessStatus('success');
      setProcessMessage('Congratulations! Your account has been upgraded to Reseller status.');
      await refreshProfile();
    } catch (error: any) {
      setProcessStatus('error');
      setProcessMessage(error.message || 'Failed to upgrade account');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      title: 'Lower Prices',
      description: 'Get massive discounts on all services including Data, Airtime, and Bills.',
      icon: Percent,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Profit Tracking',
      description: 'Access a dedicated dashboard to track your sales and monitor your profits.',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Priority Support',
      description: 'Get faster responses from our support team for all your queries.',
      icon: Headphones,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'API Access',
      description: 'Integrate our services into your own website or application seamlessly.',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
          <Star className="w-4 h-4 fill-blue-700" />
          Premium Opportunity
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
          Become a <span className="text-blue-700">Reseller</span>
        </h1>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg">
          Join thousands of successful entrepreneurs earning daily by reselling our high-quality VTU services.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", benefit.bg)}>
                <benefit.icon className={cn("w-7 h-7", benefit.color)} />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="sticky top-24">
          <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-blue-100 border border-blue-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upgrade Fee</p>
                  <p className="text-3xl font-black text-gray-900">₦{UPGRADE_FEE.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Balance</p>
                    <p className="text-sm font-black text-gray-900">₦{profile?.balance?.toLocaleString() || '0.00'}</p>
                  </div>
                </div>
                
                {profile && profile.balance < UPGRADE_FEE && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-[11px] text-amber-800 font-bold leading-tight">
                      You need ₦{(UPGRADE_FEE - profile.balance).toLocaleString()} more to upgrade. You will be redirected to fund your wallet.
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {profile && profile.balance < UPGRADE_FEE ? 'Fund & Upgrade' : 'Upgrade Now'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="space-y-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">What's Included</p>
                {[
                  'Lifetime Reseller Status',
                  'Instant Profit Tracking',
                  'Exclusive Price List',
                  '24/7 Dedicated Support'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProcessingModal 
        isOpen={showProcessing}
        status={processStatus}
        message={processMessage}
        onClose={() => {
          setShowProcessing(false);
          if (processStatus === 'success') navigate('/dashboard');
        }}
      />
    </div>
  );
}
