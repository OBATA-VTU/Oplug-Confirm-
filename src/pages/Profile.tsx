import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Phone, MapPin, Shield, 
  Camera, Check, AlertCircle, Landmark, 
  Lock, Bell, Smartphone, Globe, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Profile() {
  const { profile, user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    username: profile?.username || '',
    phone: profile?.phone || '',
    state: profile?.state || '',
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        isProfileComplete: true
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 bg-blue-50 rounded-[2.5rem] flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-blue-200" />
            )}
          </div>
          <button className="absolute -bottom-2 -right-2 p-3 bg-blue-700 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
            <Camera className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">{profile?.fullName || profile?.username}</h1>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
              {profile?.role || 'User'}
            </span>
          </div>
          <p className="text-gray-500 font-medium mb-4">{profile?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-gray-600">Verified Account</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
              <Landmark className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-600">Virtual Active</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={cn(
            "px-8 py-4 rounded-2xl font-black text-sm transition-all",
            isEditing ? "bg-gray-100 text-gray-600" : "bg-blue-700 text-white shadow-lg shadow-blue-200"
          )}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <User className="w-6 h-6 text-blue-700" />
              Personal Information
            </h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Username</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="tel" 
                      disabled={!isEditing}
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">State of Residence</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      disabled={!isEditing}
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Virtual Account Details */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <Landmark className="w-6 h-6 text-emerald-600" />
              Virtual Account Details
            </h3>
            
            {profile?.virtualAccount ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Bank Name</p>
                  <p className="text-lg font-black text-emerald-900">{profile.virtualAccount.bank_name}</p>
                </div>
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Account Number</p>
                  <p className="text-lg font-black text-blue-900">{profile.virtualAccount.account_number}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 md:col-span-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Name</p>
                  <p className="text-lg font-black text-gray-900">{profile.virtualAccount.account_name}</p>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                <p className="text-red-900 font-black">Virtual Account Not Generated</p>
                <p className="text-sm text-red-700">Please contact support to generate your automated funding account.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
              <Lock className="w-5 h-5 text-orange-600" />
              Security
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                <span className="text-sm font-bold text-gray-600">Change Password</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                <span className="text-sm font-bold text-gray-600">Transaction PIN</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase rounded-lg">Active</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                <span className="text-sm font-bold text-gray-600">Two-Factor Auth</span>
                <span className="px-2 py-1 bg-gray-200 text-gray-500 text-[8px] font-black uppercase rounded-lg">Off</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-600" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-bold text-gray-600">Email Alerts</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-bold text-gray-600">Push Notifications</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2">
                <span className="text-sm font-bold text-gray-600">SMS Alerts</span>
                <div className="w-10 h-5 bg-gray-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
