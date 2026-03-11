import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Globe, Shield, Bell, Image as ImageIcon, Plus, X, RefreshCw, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { vtuService, smmService } from '../services/apiService';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    siteName: 'Oplug',
    siteDescription: 'The most reliable VTU platform in Nigeria.',
    announcement: '',
    supportedLogos: [],
    contactEmail: '',
    contactPhone: '',
    whatsappNumber: '',
    referralBonus: 0,
    firstDepositBonus: 0,
    minFundingAmount: 100,
    fundingFee: 50,
    heroImage: 'https://illustrations.popsy.co/blue/woman-with-smartphone.svg',
    fastDeliveryImage: 'https://illustrations.popsy.co/blue/man-on-rocket.svg',
    resellerImage: 'https://illustrations.popsy.co/blue/shaking-hands.svg',
    developerImage: 'https://illustrations.popsy.co/white/web-design.svg',
    fundingImage: 'https://illustrations.popsy.co/blue/payment-processed.svg',
    supportImage: 'https://illustrations.popsy.co/blue/customer-support.svg'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState({ vtu: false, smm: false });
  const [message, setMessage] = useState('');
  const [newLogo, setNewLogo] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
      setMessage('Settings updated successfully!');
    } catch (err) {
      setMessage('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncVTU = async () => {
    setSyncing(prev => ({ ...prev, vtu: true }));
    try {
      await vtuService.syncToFirestore();
      setMessage('VTU Services synced to database successfully!');
    } catch (err) {
      setMessage('Failed to sync VTU services.');
    } finally {
      setSyncing(prev => ({ ...prev, vtu: false }));
    }
  };

  const handleSyncSMM = async () => {
    setSyncing(prev => ({ ...prev, smm: true }));
    try {
      await smmService.syncToFirestore();
      setMessage('SMM Services synced to database successfully!');
    } catch (err) {
      setMessage('Failed to sync SMM services.');
    } finally {
      setSyncing(prev => ({ ...prev, smm: false }));
    }
  };

  const addLogo = () => {
    if (newLogo) {
      setSettings({ ...settings, supportedLogos: [...settings.supportedLogos, newLogo] });
      setNewLogo('');
    }
  };

  const removeLogo = (index: number) => {
    const newLogos = [...settings.supportedLogos];
    newLogos.splice(index, 1);
    setSettings({ ...settings, supportedLogos: newLogos });
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">System Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl text-sm font-bold border",
          message.includes('success') ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sync Services */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-700" />
              Database Sync
            </h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Admin Only</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">Sync all services from VTU and SMM panels to Firestore for faster loading on the user-facing website.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleSyncVTU}
              disabled={syncing.vtu}
              className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all group"
            >
              <div className="text-left">
                <p className="text-sm font-black text-blue-900">Sync VTU Services</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Airtime, Data, Cable, etc.</p>
              </div>
              <RefreshCw className={cn("w-6 h-6 text-blue-700 transition-transform", syncing.vtu && "animate-spin")} />
            </button>
            <button 
              onClick={handleSyncSMM}
              disabled={syncing.smm}
              className="flex items-center justify-between p-6 bg-purple-50 rounded-3xl border border-purple-100 hover:bg-purple-100 transition-all group"
            >
              <div className="text-left">
                <p className="text-sm font-black text-purple-900">Sync SMM Services</p>
                <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1">Social Media Boosters</p>
              </div>
              <RefreshCw className={cn("w-6 h-6 text-purple-700 transition-transform", syncing.smm && "animate-spin")} />
            </button>
          </div>
        </div>
        {/* General Settings */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-700" />
            General
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Site Description</label>
              <textarea 
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Announcement (Dashboard)</label>
              <input 
                type="text" 
                value={settings.announcement}
                onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-700" />
            Financials
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Min Funding (₦)</label>
              <input 
                type="number" 
                value={settings.minFundingAmount}
                onChange={(e) => setSettings({ ...settings, minFundingAmount: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Funding Fee (₦)</label>
              <input 
                type="number" 
                value={settings.fundingFee}
                onChange={(e) => setSettings({ ...settings, fundingFee: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Referral Bonus (₦)</label>
              <input 
                type="number" 
                value={settings.referralBonus}
                onChange={(e) => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">1st Deposit Bonus (₦)</label>
              <input 
                type="number" 
                value={settings.firstDepositBonus}
                onChange={(e) => setSettings({ ...settings, firstDepositBonus: Number(e.target.value) })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Support & Contact */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-700" />
            Support & Contact
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">WhatsApp Number</label>
              <input 
                type="text" 
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Support Email</label>
              <input 
                type="email" 
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Partner Logos */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-orange-700" />
            Partner Logos
          </h3>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newLogo}
                onChange={(e) => setNewLogo(e.target.value)}
                placeholder="Logo URL (SVG/PNG)"
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={addLogo}
                className="bg-blue-700 text-white p-3 rounded-xl hover:bg-blue-800 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {settings.supportedLogos?.map((logo: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={logo} alt="Logo" className="h-8 bg-gray-50 p-1 rounded border border-gray-100" />
                  <button 
                    onClick={() => removeLogo(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Homepage Images */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 md:col-span-2">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-700" />
            Homepage Illustrations (SVG/PNG URLs)
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Hero Image (Woman with Phone)</label>
              <input 
                type="text" 
                value={settings.heroImage || ''}
                onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                placeholder="https://illustrations.popsy.co/blue/woman-with-smartphone.svg"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Fast Delivery (Man on Rocket)</label>
              <input 
                type="text" 
                value={settings.fastDeliveryImage || ''}
                onChange={(e) => setSettings({ ...settings, fastDeliveryImage: e.target.value })}
                placeholder="https://illustrations.popsy.co/blue/man-on-rocket.svg"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Reseller (Shaking Hands)</label>
              <input 
                type="text" 
                value={settings.resellerImage || ''}
                onChange={(e) => setSettings({ ...settings, resellerImage: e.target.value })}
                placeholder="https://illustrations.popsy.co/blue/shaking-hands.svg"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Developer (Web Design)</label>
              <input 
                type="text" 
                value={settings.developerImage || ''}
                onChange={(e) => setSettings({ ...settings, developerImage: e.target.value })}
                placeholder="https://illustrations.popsy.co/white/web-design.svg"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Funding (Payment Processed)</label>
              <input 
                type="text" 
                value={settings.fundingImage || ''}
                onChange={(e) => setSettings({ ...settings, fundingImage: e.target.value })}
                placeholder="https://illustrations.popsy.co/blue/payment-processed.svg"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Support (Customer Support)</label>
              <input 
                type="text" 
                value={settings.supportImage || ''}
                onChange={(e) => setSettings({ ...settings, supportImage: e.target.value })}
                placeholder="https://illustrations.popsy.co/blue/customer-support.svg"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
