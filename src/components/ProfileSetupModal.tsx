import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { fundingService } from '../services/apiService';

export default function ProfileSetupModal() {
  const { profile, user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  if (!profile || profile.isProfileComplete || skipped) return null;
  
  // If they already have a virtual account, don't show the setup
  if (profile.virtualAccount && profile.virtualAccount.account_number) return null;

  const handleSkip = () => {
    setSkipped(true);
  };

  const handleGenerateAccounts = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate PalmPay Account (Primary)
      const palmpayRes = await fundingService.generateVirtualAccount({
        email: profile.email,
        reference: `VAG_${user?.uid}_${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        bank: 'PALMPAY'
      });

      if (!palmpayRes.status) {
        throw new Error(palmpayRes.message || 'Failed to generate account');
      }

      const account = palmpayRes.data.account[0];

      // Update Firestore with the new structure
      await updateDoc(doc(db, 'users', profile.id), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        virtualAccount: {
          account_name: account.account_name || 'N/A',
          account_number: account.account_number || 'N/A',
          bank_id: account.bank_id || 'N/A',
          bank_name: account.bank_name || 'N/A',
          reference: account.reference || `REF_${Date.now()}`
        },
        isProfileComplete: true
      });

      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 -z-10" />
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-2">
                <User className="w-8 h-8 text-blue-700" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Personalize Your Experience</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Complete your profile to unlock all features, including permanent virtual accounts for automatic funding and personalized support.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all"
                >
                  Complete Profile
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleSkip}
                  className="w-full bg-gray-50 text-gray-500 font-bold py-4 rounded-2xl hover:bg-gray-100 transition-all"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-blue-700" />
                  Account Details
                </h3>
                <button onClick={handleSkip} className="text-xs font-bold text-gray-400 hover:text-gray-600">Skip</button>
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">First Name</label>
                  <input 
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Enter your first name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Last Name</label>
                  <input 
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Enter your last name"
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="08012345678"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerateAccounts}
                disabled={loading}
                className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Generating Account...' : 'Generate Virtual Account'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold">Setup Complete!</h2>
              <p className="text-gray-500 text-sm">
                Your virtual account has been generated successfully. You can now fund your wallet and start using Oplug.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
