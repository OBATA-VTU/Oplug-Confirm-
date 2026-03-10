import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, Bell, Smartphone, Camera, CheckCircle2, Key, Copy, AtSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Profile() {
  const { profile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    phone: profile?.phone || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user?.uid || ''), formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-2xl text-sm font-bold border",
          message.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="space-y-2">
          <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-700 text-white rounded-full shadow-lg hover:bg-blue-800 transition-all">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h3 className="font-bold text-lg">{profile?.fullName || profile?.username || 'User'}</h3>
            <p className="text-xs text-gray-500">{profile?.email}</p>
            <div className="mt-4 flex justify-center">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-wider">
                {profile?.role || 'User'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            {[
              { label: 'Profile Information', icon: User, active: true },
              { label: 'Security & Password', icon: Shield },
              { label: 'Notifications', icon: Bell },
              { label: 'Two-Factor Auth', icon: Smartphone },
            ].map((item, i) => (
              <button 
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                  item.active ? "bg-blue-700 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-8">Profile Details</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Username</label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={profile?.username || ''}
                      disabled
                      className="w-full bg-gray-100 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={profile?.email || ''}
                    disabled
                    className="w-full bg-gray-100 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-blue-100 hover:bg-blue-800 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-700" />
              API Access
            </h3>
            <div className="space-y-4">
              <p className="text-xs text-gray-500">Your unique API key for developer integrations.</p>
              {profile?.apiKey ? (
                <div className="relative group">
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono text-gray-600 break-all pr-12">
                    {profile.apiKey}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(profile.apiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <Link to="/developer" className="inline-flex items-center gap-2 text-blue-700 font-bold text-sm hover:underline">
                  Generate API Key in Developer Settings
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-6">KYC Verification</h3>
            <div className={cn(
              "flex items-center justify-between p-6 rounded-3xl border",
              profile?.status === 'active' ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"
            )}>
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  profile?.status === 'active' ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                )}>
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className={cn("text-sm font-bold", profile?.status === 'active' ? "text-emerald-800" : "text-amber-800")}>
                    {profile?.status === 'active' ? 'Verified Account' : 'Unverified Account'}
                  </p>
                  <p className={cn("text-xs", profile?.status === 'active' ? "text-emerald-700" : "text-amber-700")}>
                    {profile?.status === 'active' ? 'Your account is fully verified.' : 'Verify your BVN to increase your daily limits.'}
                  </p>
                </div>
              </div>
              {profile?.status !== 'active' && (
                <button className="bg-amber-600 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-amber-700 transition-all">
                  Verify Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
