import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Save, Tag, Percent, ShoppingBag, Smartphone, Wifi, Tv, Zap, Users, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminPrices() {
  const [prices, setPrices] = useState({
    airtime: { markup: 0, resellerDiscount: 2, displayName: 'Airtime Topup' },
    data: { markup: 5, resellerDiscount: 3, displayName: 'Data Bundles' },
    cable: { markup: 100, resellerDiscount: 50, displayName: 'Cable TV' },
    electricity: { markup: 100, resellerDiscount: 50, displayName: 'Electricity Bills' },
    education: { markup: 200, resellerDiscount: 100, displayName: 'Education Pins' },
    smm: { markup: 15, resellerDiscount: 5, displayName: 'SMM Services' },
    upgradeFee: 1200,
    smartUserLabel: 'Smart User',
    resellerLabel: 'Reseller'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'prices'));
        if (docSnap.exists()) {
          setPrices({ ...prices, ...docSnap.data() });
        }
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'prices'), prices, { merge: true });
      setMessage('Prices updated successfully!');
    } catch (err) {
      setMessage('Failed to update prices.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading prices...</div>;

  return (
    <div className="space-y-8 max-w-5xl pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Price Management</h1>
          <p className="text-gray-500 font-medium">Control profit margins and plan labels.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={cn(
          "p-5 rounded-2xl text-sm font-bold border",
          message.includes('success') ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message}
        </div>
      )}

      {/* Plan Labels & Upgrade Fee */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-lg font-black flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Plan Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Smart User Label</label>
            <input 
              type="text" 
              value={prices.smartUserLabel}
              onChange={(e) => setPrices({ ...prices, smartUserLabel: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Reseller Label</label>
            <input 
              type="text" 
              value={prices.resellerLabel}
              onChange={(e) => setPrices({ ...prices, resellerLabel: e.target.value })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Upgrade Fee (₦)</label>
            <input 
              type="number" 
              value={prices.upgradeFee}
              onChange={(e) => setPrices({ ...prices, upgradeFee: Number(e.target.value) })}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { key: 'airtime', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
          { key: 'data', icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50' },
          { key: 'cable', icon: Tv, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { key: 'electricity', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { key: 'education', icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { key: 'smm', icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((item) => (
          <div key={item.key} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-3 rounded-2xl", item.bg)}>
                  <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
                <h3 className="font-black capitalize text-gray-900">{(prices as any)[item.key].displayName}</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-200" />
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={(prices as any)[item.key].displayName}
                  onChange={(e) => setPrices({
                    ...prices, 
                    [item.key]: { ...(prices as any)[item.key], displayName: e.target.value }
                  })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    {item.key === 'cable' || item.key === 'electricity' || item.key === 'education' ? 'Profit (₦)' : 'Profit (%)'}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={(prices as any)[item.key].markup}
                      onChange={(e) => setPrices({
                        ...prices, 
                        [item.key]: { ...(prices as any)[item.key], markup: Number(e.target.value) }
                      })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {item.key === 'cable' || item.key === 'electricity' || item.key === 'education' ? '₦' : '%'}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    Reseller Disc. ({item.key === 'cable' || item.key === 'electricity' || item.key === 'education' ? '₦' : '%'})
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={(prices as any)[item.key].resellerDiscount}
                      onChange={(e) => setPrices({
                        ...prices, 
                        [item.key]: { ...(prices as any)[item.key], resellerDiscount: Number(e.target.value) }
                      })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                      {item.key === 'cable' || item.key === 'electricity' || item.key === 'education' ? '₦' : '%'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
