import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { getFriendlyErrorMessage } from '../lib/errorHandlers';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      showToast('success', 'Email Sent', 'Check your inbox for password reset instructions.');
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      setError(friendlyMsg);
      showToast('error', 'Request Failed', friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle="We've sent password reset instructions to your email address."
      >
        <div className="text-center space-y-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/50 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          
          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <p className="text-sm font-bold text-gray-600 leading-relaxed">
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setSubmitted(false)}
              className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98]"
            >
              TRY ANOTHER EMAIL
            </button>
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm font-black text-gray-400 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO LOGIN
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive reset instructions"
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl mb-6 border border-red-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              SEND RESET LINK
            </>
          )}
        </button>

        <Link 
          to="/login" 
          className="flex items-center justify-center gap-2 text-sm font-black text-gray-400 hover:text-blue-700 transition-colors pt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          BACK TO LOGIN
        </Link>
      </form>
    </AuthLayout>
  );
}
