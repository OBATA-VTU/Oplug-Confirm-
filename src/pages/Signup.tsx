import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, AtSign, Chrome } from 'lucide-react';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must agree to the Terms of Services');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Profile creation is handled by AuthProvider onSnapshot
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-2xl">O</span>
            </div>
            <span className="text-3xl font-bold text-blue-700">OPLUG</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Signup</h1>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Fullname"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-blue-700 focus:outline-none transition-colors text-sm"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-blue-700 focus:outline-none transition-colors text-sm"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-12 pr-12 py-4 bg-gray-50 border-b-2 border-gray-200 focus:border-blue-700 focus:outline-none transition-colors text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="terms" 
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required 
            />
            <label htmlFor="terms" className="text-xs text-gray-500">
              I agree to the <Link to="/terms" className="font-bold text-gray-700 hover:underline">Terms of Services</Link>
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? 'SIGNING UP...' : (
              <>
                <UserPlus className="w-5 h-5" />
                SIGNUP
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-bold">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignup}
          className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
        >
          <Chrome className="w-5 h-5 text-blue-600" />
          Google Account
        </button>

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
