import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Shield, 
  Camera, Check, AlertCircle, Landmark, 
  Lock, Bell, Smartphone, Globe, ChevronRight,
  Code, Download, LogOut, ShieldCheck, CreditCard,
  Copy, Loader2, UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import PinModal from '../components/PinModal';
import axios from 'axios';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const { profile, logout, setTransactionPin, refreshProfile, user } = useAuth();
  const navigate = useNavigate();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;

    const file = e.target.files[0];
    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error('ImgBB API Key is missing. Please set VITE_IMGBB_API_KEY in your environment.');
      }

      console.log('Uploading profile picture to ImgBB...');
      const uploadRes = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      
      if (!uploadRes.data || !uploadRes.data.data || !uploadRes.data.data.url) {
        throw new Error('Invalid response from ImgBB');
      }

      const photoURL = uploadRes.data.data.url;
      console.log('Upload successful:', photoURL);

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL: photoURL
      });

      await refreshProfile();
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const settingsGroups = [
    {
      title: 'Account Settings',
      items: [
        { 
          name: 'Personal Information', 
          description: 'Update your name, phone and address',
          icon: User, 
          path: '/profile/personal-info',
          color: 'bg-blue-50 text-blue-700'
        },
        ...(!profile?.isPhoneVerified ? [{
          name: 'Verify Account',
          description: 'Verify your email to secure your account',
          icon: ShieldCheck,
          path: '/verify-phone',
          color: 'bg-amber-50 text-amber-700'
        }] : []),
        { 
          name: 'Security & Password', 
          description: 'Change your password and secure account',
          icon: Lock, 
          path: '/profile/password',
          color: 'bg-emerald-50 text-emerald-700'
        },
        { 
          name: 'Transaction PIN', 
          description: profile?.isPinSet ? 'Change your 5-digit security PIN' : 'Set a 5-digit security PIN',
          icon: ShieldCheck, 
          onClick: () => setShowPinSetup(true),
          color: 'bg-indigo-50 text-indigo-700'
        },
        { 
          name: 'API & Webhooks', 
          description: 'Manage your developer keys and hooks',
          icon: Code, 
          path: '/profile/api-webhook',
          color: 'bg-purple-50 text-purple-700'
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          name: 'Notifications', 
          description: 'Control how we communicate with you',
          icon: Bell, 
          path: '/profile/notifications',
          color: 'bg-amber-50 text-amber-700'
        },
        { 
          name: 'Download App', 
          description: 'Get Oplug on your mobile device',
          icon: Smartphone, 
          path: '/profile/download-app',
          color: 'bg-red-50 text-red-700'
        },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-100 transform group-hover:scale-105 transition-all overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                profile?.fullName?.charAt(0) || profile?.username?.charAt(0)
              )}
              
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center text-gray-400 hover:text-blue-700 transition-colors disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">
              {profile?.fullName || profile?.username}
            </h1>
            <p className="text-gray-500 font-medium mb-4">{profile?.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                {profile?.role || 'Smart User'}
              </span>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                profile?.isPhoneVerified 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                  : "bg-amber-50 text-amber-700 border-amber-100"
              )}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {profile?.isPhoneVerified ? 'Verified Account' : 'Unverified Account'}
              </span>
            </div>
            {uploadError && (
              <p className="text-red-500 text-[10px] font-bold mt-2">{uploadError}</p>
            )}
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Wallet Balance</p>
            <p className="text-3xl font-black text-blue-700">₦{profile?.balance?.toLocaleString() || '0.00'}</p>
            <Link to="/fund" className="text-xs font-black text-blue-700 underline underline-offset-4 hover:text-blue-800">
              Add Funds
            </Link>
          </div>
        </div>
        
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Settings Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{group.title}</h3>
            <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 space-y-2">
              {group.items.map((item, itemIdx) => {
                const content = (
                  <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-all group cursor-pointer w-full text-left">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{item.name}</p>
                        <p className="text-[10px] font-bold text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                  </div>
                );

                if (item.onClick) {
                  return (
                    <button key={itemIdx} onClick={item.onClick} className="w-full">
                      {content}
                    </button>
                  );
                }

                return (
                  <Link key={itemIdx} to={item.path || '#'}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-black text-red-900 mb-1">Sign Out</h3>
          <p className="text-xs text-red-700 font-medium">Are you sure you want to log out of your account?</p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Logout Now
        </button>
      </div>

      <PinModal 
        isOpen={showPinSetup}
        onClose={() => setShowPinSetup(false)}
        onSuccess={async (pin) => {
          if (pin) {
            await setTransactionPin(pin);
            alert('Transaction PIN updated successfully!');
          }
        }}
        mode="setup"
      />
    </div>
  );
}
