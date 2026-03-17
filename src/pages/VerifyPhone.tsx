import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Smartphone, ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AuthLayout from '../components/AuthLayout';

export default function VerifyPhone() {
  const { user, profile, loading: authLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [timer, setTimer] = useState(0);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
    if (profile?.isPhoneVerified) {
      navigate('/dashboard');
    }
    if (profile?.phone) {
      setPhone(profile.phone);
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      
      // Ensure phone is in international format
      let formattedPhone = phone;
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+234' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+234' + formattedPhone;
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(result);
      setStep('otp');
      setTimer(60);
      showToast('success', 'OTP Sent', 'A verification code has been sent to your phone.');
    } catch (err: any) {
      console.error('OTP Send Error:', err);
      setError(err.message || 'Failed to send OTP. Please try again.');
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;

    setLoading(true);
    setError('');
    try {
      await confirmationResult.confirm(otp);
      
      // Update profile
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          isPhoneVerified: true,
          phone: phone // Update if they changed it
        });
      }

      showToast('success', 'Verified!', 'Your phone number has been verified successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify Phone" 
      subtitle={step === 'phone' ? "Confirm your phone number to secure your account" : "Enter the 6-digit code sent to your phone"}
    >
      <div id="recaptcha-container"></div>

      <AnimatePresence mode="wait">
        {step === 'phone' ? (
          <motion.form 
            key="phone-step"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSendOtp} 
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Smartphone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
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
              disabled={loading}
              className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <span>SEND VERIFICATION CODE</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
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

            <div className="text-center">
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
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600"
              >
                Change Phone Number
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
