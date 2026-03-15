import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Globe, Shield, Bell, Image as ImageIcon, Plus, X, RefreshCw, Database, Layout } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState<'general' | 'financials' | 'content' | 'services'>('general');
  const [content, setContent] = useState<any>({
    about: { title: '', subtitle: '', content: '' },
    terms: { title: '', subtitle: '', sections: [] },
    privacy: { title: '', subtitle: '', sections: [] },
    contact: { title: '', subtitle: '', email: '', phone: '', address: '' },
    support: { title: '', subtitle: '', socialLinks: [] }
  });
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch General Settings
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
          setSettings({ ...settings, ...docSnap.data() });
        }

        // Fetch Page Contents
        const pages = ['about', 'terms', 'privacy', 'contact', 'support'];
        const newContent = { ...content };
        for (const page of pages) {
          const snap = await getDoc(doc(db, 'pages', page));
          if (snap.exists()) {
            newContent[page] = snap.data();
          }
        }
        setContent(newContent);

        // Fetch Services
        const servicesSnap = await getDoc(doc(db, 'settings', 'services'));
        if (servicesSnap.exists()) {
          setServices(servicesSnap.data().list || []);
        }

        // Fetch Prices Config
        const pricesSnap = await getDoc(doc(db, 'settings', 'prices'));
        if (pricesSnap.exists()) {
          setSettings(prev => ({ ...prev, prices: pricesSnap.data() }));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Save General Settings
      await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });

      // Save Page Contents
      const pages = ['about', 'terms', 'privacy', 'contact', 'support'];
      for (const page of pages) {
        await setDoc(doc(db, 'pages', page), content[page]);
      }

      // Save Services
      await setDoc(doc(db, 'settings', 'services'), { list: services });

      // Save Prices Config
      if (settings.prices) {
        await setDoc(doc(db, 'settings', 'prices'), settings.prices);
      }

      setMessage('All settings and content updated successfully!');
    } catch (err) {
      console.error('Save error:', err);
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
          onClick={handleSaveAll}
          disabled={saving}
          className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
        {[
          { id: 'general', name: 'General', icon: Globe },
          { id: 'financials', name: 'Financials', icon: Shield },
          { id: 'content', name: 'Pages Content', icon: Database },
          { id: 'services', name: 'Pricing Services', icon: Plus },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all",
              activeTab === tab.id 
                ? "bg-white text-blue-700 shadow-sm" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {message && (
        <div className={cn(
          "p-4 rounded-2xl text-sm font-bold border",
          message.includes('success') ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message}
        </div>
      )}

      <div className="space-y-8">
        {activeTab === 'general' && (
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
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-700" />
                Homepage Illustrations
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Hero Image</label>
                  <input 
                    type="text" 
                    value={settings.heroImage || ''}
                    onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Fast Delivery</label>
                  <input 
                    type="text" 
                    value={settings.fastDeliveryImage || ''}
                    onChange={(e) => setSettings({ ...settings, fastDeliveryImage: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Partner Logos */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 md:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-700" />
                  Partner Logos
                </h3>
                <button 
                  onClick={() => setSettings({ ...settings, supportedLogos: [...(settings.supportedLogos || []), ''] })}
                  className="text-blue-700 text-xs font-black uppercase tracking-widest hover:underline"
                >
                  + Add Logo
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(settings.supportedLogos || []).map((logo: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={logo}
                      onChange={(e) => {
                        const newLogos = [...settings.supportedLogos];
                        newLogos[idx] = e.target.value;
                        setSettings({ ...settings, supportedLogos: newLogos });
                      }}
                      placeholder="Logo URL"
                      className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      onClick={() => {
                        const newLogos = settings.supportedLogos.filter((_: any, i: number) => i !== idx);
                        setSettings({ ...settings, supportedLogos: newLogos });
                      }}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Homepage Illustrations */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 md:col-span-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layout className="w-5 h-5 text-blue-700" />
                Homepage Illustrations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Hero Illustration</label>
                  <input 
                    type="text" 
                    value={settings.illustrationUrls?.hero || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      illustrationUrls: { ...(settings.illustrationUrls || {}), hero: e.target.value } 
                    })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Features Illustration</label>
                  <input 
                    type="text" 
                    value={settings.illustrationUrls?.features || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      illustrationUrls: { ...(settings.illustrationUrls || {}), features: e.target.value } 
                    })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">About Illustration</label>
                  <input 
                    type="text" 
                    value={settings.illustrationUrls?.about || ''}
                    onChange={(e) => setSettings({ 
                      ...settings, 
                      illustrationUrls: { ...(settings.illustrationUrls || {}), about: e.target.value } 
                    })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-700" />
                General Financials
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

            {/* Pricing Markups */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-700" />
                Pricing Markups & Discounts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['airtime', 'data', 'cable', 'electricity', 'education', 'smm'].map((cat) => (
                  <div key={cat} className="p-6 bg-gray-50 rounded-3xl space-y-4">
                    <h4 className="font-black capitalize text-gray-900">{cat}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Markup (%)</label>
                        <input 
                          type="number" 
                          value={settings.prices?.[cat]?.markup || 0}
                          onChange={(e) => {
                            const newPrices = { ...settings.prices };
                            if (!newPrices[cat]) newPrices[cat] = {};
                            newPrices[cat].markup = Number(e.target.value);
                            setSettings({ ...settings, prices: newPrices });
                          }}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Reseller Disc (%)</label>
                        <input 
                          type="number" 
                          value={settings.prices?.[cat]?.resellerDiscount || 0}
                          onChange={(e) => {
                            const newPrices = { ...settings.prices };
                            if (!newPrices[cat]) newPrices[cat] = {};
                            newPrices[cat].resellerDiscount = Number(e.target.value);
                            setSettings({ ...settings, prices: newPrices });
                          }}
                          className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            {['about', 'terms', 'privacy', 'contact', 'support'].map((page) => (
              <div key={page} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-xl font-bold capitalize">{page} Page</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Title</label>
                    <input 
                      type="text" 
                      value={content[page]?.title || ''}
                      onChange={(e) => setContent({ 
                        ...content, 
                        [page]: { ...content[page], title: e.target.value } 
                      })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Subtitle</label>
                    <input 
                      type="text" 
                      value={content[page]?.subtitle || ''}
                      onChange={(e) => setContent({ 
                        ...content, 
                        [page]: { ...content[page], subtitle: e.target.value } 
                      })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  {page === 'about' && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Main Content</label>
                      <textarea 
                        rows={6}
                        value={content[page]?.content || ''}
                        onChange={(e) => setContent({ 
                          ...content, 
                          [page]: { ...content[page], content: e.target.value } 
                        })}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Pricing Services</h3>
              <button 
                onClick={() => setServices([...services, { id: '', name: '', category: 'data', basePrice: 0, duration: '30 Days' }])}
                className="text-blue-700 font-bold text-sm flex items-center gap-1 hover:underline"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>
            <div className="space-y-4">
              {services.map((service, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-2xl relative group">
                  <input 
                    type="text" 
                    placeholder="ID"
                    value={service.id}
                    onChange={(e) => {
                      const newServices = [...services];
                      newServices[i].id = e.target.value;
                      setServices(newServices);
                    }}
                    className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                  <input 
                    type="text" 
                    placeholder="Name"
                    value={service.name}
                    onChange={(e) => {
                      const newServices = [...services];
                      newServices[i].name = e.target.value;
                      setServices(newServices);
                    }}
                    className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold md:col-span-2"
                  />
                  <input 
                    type="number" 
                    placeholder="Price"
                    value={service.basePrice}
                    onChange={(e) => {
                      const newServices = [...services];
                      newServices[i].basePrice = Number(e.target.value);
                      setServices(newServices);
                    }}
                    className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                  <button 
                    onClick={() => {
                      const newServices = [...services];
                      newServices.splice(i, 1);
                      setServices(newServices);
                    }}
                    className="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
