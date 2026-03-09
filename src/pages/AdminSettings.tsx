import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Globe, Bell, ShieldCheck, DollarSign, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Oplug',
    siteDescription: 'Fastest VTU Platform in Nigeria',
    supportEmail: 'support@oplug.com',
    supportPhone: '08142452729',
    whatsappGroup: 'https://chat.whatsapp.com/your-group-link',
    minFunding: 100,
    referralBonus: 50,
    maintenanceMode: false,
    announcement: 'Welcome to Oplug! Enjoy instant delivery on all services.',
    supportedLogos: [
      'https://upload.wikimedia.org/wikipedia/commons/4/4b/MTN_Logo.svg',
      'https://upload.wikimedia.org/wikipedia/en/9/9f/Airtel_logo.svg',
      'https://upload.wikimedia.org/wikipedia/commons/b/b0/Glo_Logo.svg'
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      await setDoc(doc(db, 'settings', 'general'), settings);
      setMessage('Settings saved successfully!');
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const addLogo = () => {
    if (newLogo && !settings.supportedLogos.includes(newLogo)) {
      setSettings({ ...settings, supportedLogos: [...settings.supportedLogos, newLogo] });
      setNewLogo('');
    }
  };

  const removeLogo = (url: string) => {
    setSettings({ ...settings, supportedLogos: settings.supportedLogos.filter(l => l !== url) });
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
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
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-700" />
            General Info
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Site Name</label>
              <input 
                type="text" 
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Site Description</label>
              <textarea 
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-700" />
            Announcements
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Dashboard Notice</label>
              <textarea 
                value={settings.announcement}
                onChange={(e) => setSettings({...settings, announcement: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="Enter text to show on user dashboard..."
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Disable site for users</p>
              </div>
              <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  settings.maintenanceMode ? "bg-red-500" : "bg-gray-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                  settings.maintenanceMode ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700" />
            Financial Rules
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Min Funding Amount (₦)</label>
              <input 
                type="number" 
                value={settings.minFunding}
                onChange={(e) => setSettings({...settings, minFunding: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Referral Bonus (₦)</label>
              <input 
                type="number" 
                value={settings.referralBonus}
                onChange={(e) => setSettings({...settings, referralBonus: Number(e.target.value)})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-700" />
            Support Contact
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail}
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Support WhatsApp</label>
              <input 
                type="text" 
                value={settings.supportPhone}
                onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">WhatsApp Group Link</label>
              <input 
                type="text" 
                value={settings.whatsappGroup}
                onChange={(e) => setSettings({...settings, whatsappGroup: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 col-span-full">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-pink-700" />
            Supported Partner Logos (SVG URLs)
          </h3>
          <div className="space-y-6">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newLogo}
                onChange={(e) => setNewLogo(e.target.value)}
                placeholder="Enter SVG logo URL..."
                className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button 
                onClick={addLogo}
                className="bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Logo
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {settings.supportedLogos.map((logo, i) => (
                <div key={i} className="relative group bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-center h-24">
                  <img src={logo} alt="Partner Logo" className="max-h-full max-w-full grayscale opacity-50" />
                  <button 
                    onClick={() => removeLogo(logo)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
