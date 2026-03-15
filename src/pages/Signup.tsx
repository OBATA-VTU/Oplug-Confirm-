import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, db } from '../lib/firebase';
import { doc, setDoc, getDocs, collection, query, where, updateDoc } from 'firebase/firestore';
import { User, Mail, Smartphone, Lock, Eye, EyeOff, UserPlus, AtSign, Chrome, Users, ArrowRight, Landmark } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { getFriendlyErrorMessage, handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { useToast } from '../context/ToastContext';
import { fundingService, emailService, notificationService } from '../services/apiService';
import axios from 'axios';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralUsername, setReferralUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Services');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Check if username exists via server-side API (avoids permission issues and ghost accounts)
      const checkRes = await axios.get(`/api/auth/check-username/${username}`);
      if (!checkRes.data.available) {
        throw new Error('Username already taken');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create profile
      const fullname = `${firstName} ${lastName}`;

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          id: firebaseUser.uid,
          email: email.toLowerCase(),
          fullName: fullname,
          firstName: firstName,
          lastName: lastName,
          username: username.toLowerCase(),
          phone: phone,
          walletBalance: 0,
          role: 'user',
          status: 'active',
          referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          referralCount: 0,
          referralEarnings: 0,
          referredBy: referralUsername || null,
          isPinSet: false,
          transactionPin: '',
          isProfileComplete: false,
          createdAt: new Date(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`, auth);
      }

      // Generate Virtual Account immediately
      try {
        const palmpayRes = await fundingService.generateVirtualAccount({
          email: email.toLowerCase(),
          reference: `VAG_${firebaseUser.uid}_${Date.now()}`,
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          bank: 'PALMPAY'
        });

        if (palmpayRes.status) {
          const account = palmpayRes.data.account[0];
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            virtualAccount: {
              account_name: account.account_name || 'N/A',
              account_number: account.account_number || 'N/A',
              bank_id: account.bank_id || 'N/A',
              bank_name: account.bank_name || 'N/A',
              reference: account.reference || `REF_${Date.now()}`
            },
            isProfileComplete: true
          });

          // Create notification
          await notificationService.createNotification({
            userId: firebaseUser.uid,
            title: 'Virtual Account Generated',
            message: `Your PalmPay virtual account (${account.account_number}) has been generated successfully.`,
            type: 'success'
          });
        }
      } catch (vErr) {
        console.error('Virtual account generation failed:', vErr);
        // We don't block signup if virtual account fails, user can try later in dashboard
      }

      // Send Welcome Email
      emailService.sendWelcomeEmail(email.toLowerCase(), firstName);

      showToast('success', 'Account Created!', 'Welcome to Oplug! Your account and virtual funding account are ready.');
      navigate('/dashboard');
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      setError(friendlyMsg);
      showToast('error', 'Signup Failed', friendlyMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('success', 'Welcome!', 'You have successfully signed up with Google.');
      navigate('/dashboard');
    } catch (err: any) {
      const friendlyMsg = getFriendlyErrorMessage(err);
      setError(friendlyMsg);
      showToast('error', 'Google Signup Failed', friendlyMsg);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join Oplug and start enjoying premium services"
    >
      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl mb-6 border border-red-100 flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <AtSign className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
              required
            />
          </div>
        </div>

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

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Referral (Optional)</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Users className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Referral Username"
              value={referralUsername}
              onChange={(e) => setReferralUsername(e.target.value)}
              className="block w-full pl-14 pr-5 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-14 pr-14 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl focus:outline-none transition-all text-sm font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="md:col-span-2 flex items-center gap-3 pt-2">
          <div className="relative flex items-center">
            <input 
              type="checkbox" 
              id="terms" 
              className="peer sr-only" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required 
            />
            <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all" />
            <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
            </div>
          </div>
          <label htmlFor="terms" className="text-xs font-bold text-gray-500">
            I agree to the <Link to="/terms" className="text-blue-600 hover:underline">Terms of Services</Link>
          </label>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="md:col-span-2 w-full bg-blue-700 text-white font-black py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-200 active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>SETTING UP YOUR ACCOUNT...</span>
            </div>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              CREATE ACCOUNT
            </>
          )}
        </button>
      </form>

      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black">
          <span className="bg-white px-6 text-gray-400">Or continue with</span>
        </div>
      </div>

      <button 
        onClick={handleGoogleSignup}
        className="w-full bg-white border-2 border-gray-100 text-gray-700 font-black py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-200 transition-all flex items-center justify-center gap-3 group"
      >
        <Chrome className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
        Google Account
      </button>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-500 font-medium">
          Already have an account? 
          <Link to="/login" className="text-blue-600 font-black ml-2 hover:text-blue-700 inline-flex items-center gap-1 group">
            Login Instead
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
