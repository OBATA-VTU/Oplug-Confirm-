import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Mail, Smartphone, Shield, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function NotificationSettings() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    emailNotifications: profile?.emailNotifications ?? true,
    pushNotifications: profile?.pushNotifications ?? true,
    transactionAlerts: profile?.transactionAlerts ?? true,
    securityAlerts: profile?.securityAlerts ?? true,
  });

  const handleUpdate = async (key: string, value: boolean) => {
    if (!user) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', user.uid), newSettings);
      setMessage({ type: 'success', text: 'Notification settings updated!' });
    } catch (err) {
      console.error('Error updating notifications:', err);
      setMessage({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Notification Settings</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">Email Notifications</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receive updates via email</p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdate('emailNotifications', !settings.emailNotifications)}
              className={cn(
                "w-12 h-6 rounded-full transition-all duration-300 relative",
                settings.emailNotifications ? "bg-blue-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                settings.emailNotifications ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">Push Notifications</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Browser push notifications</p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdate('pushNotifications', !settings.pushNotifications)}
              className={cn(
                "w-12 h-6 rounded-full transition-all duration-300 relative",
                settings.pushNotifications ? "bg-blue-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                settings.pushNotifications ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">Transaction Alerts</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alerts for all transactions</p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdate('transactionAlerts', !settings.transactionAlerts)}
              className={cn(
                "w-12 h-6 rounded-full transition-all duration-300 relative",
                settings.transactionAlerts ? "bg-blue-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                settings.transactionAlerts ? "left-7" : "left-1"
              )} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-700" />
              </div>
              <div>
                <h3 className="text-sm font-black text-gray-900">Security Alerts</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Login and security updates</p>
              </div>
            </div>
            <button 
              onClick={() => handleUpdate('securityAlerts', !settings.securityAlerts)}
              className={cn(
                "w-12 h-6 rounded-full transition-all duration-300 relative",
                settings.securityAlerts ? "bg-blue-700" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                settings.securityAlerts ? "left-7" : "left-1"
              )} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
