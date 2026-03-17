import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthLayout from '../components/AuthLayout';
import axios from 'axios';

export default function VerifyPhone() {
  const { user, profile, loading: authLoading } = useAuth();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async () => {
    if (!user?.email || loading) return;

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/send-otp', { email: user.email });
      setTimer(60);
      showToast('success', 'OTP Sent', `A verification code has been sent to ${user.email}`);
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      hasSentOtp.current = false; // Allow retry on error
    } finally {
      setLoading(false);
    }
  };

  // Auto-send OTP on mount if not already sent
  const hasSentOtp = React.useRef(false);

  useEffect(() => {
    if (user?.email && !hasSentOtp.current && !loading && !error) {
      hasSentOtp.current = true;
      handleSendOtp();
    }
  }, [user?.email]);

  const handleAdminBypass = async () => {
    if (!user || !profile?.isAdmin) return;
    
    setLoading(true);
    try {
      const { db } = await import('../lib/firebase');
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', user.uid), {
        isPhoneVerified: true
      });
      showToast('success', 'Bypassed', 'Verification bypassed for admin.');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to bypass verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !user?.email) return;

    setLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/verify-otp', { email: user.email, otp });
      showToast('success', 'Verified!', 'Your account has been verified successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.isPhoneVerified) {
    return (
      <AuthLayout 
        title="Account Verified" 
        subtitle="Your email has been successfully verified."
      >
        <div className="text-center space-y-8 py-10">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900">You're all set!</h2>
            <p className="text-sm text-gray-500 font-medium">Thank you for securing your account.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            GO TO DASHBOARD
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Verify Email" 
      subtitle={`We've sent a 6-digit verification code to ${user?.email || 'your email'}`}
    >
      <AnimatePresence mode="wait">
        <motion.form 
          key="otp-step"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          onSubmit={handleVerifyOtp} 
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Verification Code</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium tracking-[0.5em] text-center"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <span>VERIFY & CONTINUE</span>
                <ShieldCheck className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="text-center space-y-4">
            {profile?.isAdmin && (
              <button
                type="button"
                onClick={handleAdminBypass}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all"
              >
                Skip Verification (Admin Only)
              </button>
            )}
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={timer > 0 || loading}
              className="text-xs font-black text-blue-600 hover:text-blue-700 disabled:text-gray-400 flex items-center justify-center gap-2 mx-auto"
            >
              {timer > 0 ? (
                <>Resend code in {timer}s</>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  RESEND CODE
                </>
              )}
            </button>
          </div>
        </motion.form>
      </AnimatePresence>
    </AuthLayout>
  );
}
