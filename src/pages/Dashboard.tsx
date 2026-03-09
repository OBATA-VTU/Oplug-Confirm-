import { useState, useEffect } from 'react';
import { Wallet, Users, ArrowUpRight, History, Phone, Wifi, Tv, Zap, GraduationCap, Repeat, Gift, UserPlus, ShoppingCart, Copy, Megaphone } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const services = [
  { name: 'Airtime', icon: Phone, path: '/airtime', color: 'bg-blue-100 text-blue-700' },
  { name: 'Data', icon: Wifi, path: '/data', color: 'bg-purple-100 text-purple-700' },
  { name: 'Tv', icon: Tv, path: '/cable', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Bills', icon: Zap, path: '/electricity', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Education Pin', icon: GraduationCap, path: '/education', color: 'bg-blue-100 text-blue-700' },
  { name: 'SMM Booster', icon: ShoppingCart, path: '/smm', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'P2P Transfer', icon: Repeat, path: '/transfer', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'Gift Card', icon: Gift, path: '/giftcard', color: 'bg-purple-100 text-purple-700' },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'general'));
        if (snap.exists()) {
          setSettings(snap.data());
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Announcement */}
      {settings?.announcement && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-700 text-white p-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-blue-100"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{settings.announcement}</p>
        </motion.div>
      )}

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-blue-200"
        >
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80">Hello {profile?.displayName}</p>
            <h3 className="text-xs mt-4 opacity-80">Wallet Balance</h3>
            <div className="flex items-center justify-between mt-1">
              <h2 className="text-3xl font-bold">₦{profile?.balance?.toLocaleString() || '0.00'}</h2>
              {profile?.virtualAccounts?.[0] && (
                <div className="text-right">
                  <p className="text-[10px] opacity-80">{profile.virtualAccounts[0].bank_name}</p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-mono">{profile.virtualAccounts[0].account_number}</p>
                    <button onClick={() => copyToClipboard(profile.virtualAccounts[0].account_number)}>
                      <Copy className="w-3 h-3 opacity-60" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Link to="/fund" className="bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Fund Wallet
              </Link>
              <Link to="/history" className="bg-blue-600/50 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </Link>
            </div>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-indigo-700 rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Refer & Earn!</h2>
            <p className="text-sm mt-2 opacity-90">
              Invite your friends with your referral link to earn <span className="font-bold">₦100</span> for each friend you referred.
            </p>
            <p className="text-[10px] mt-4 opacity-70">Terms & conditions apply</p>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
            <Users className="w-full h-full" />
          </div>
          <img 
            src="https://picsum.photos/seed/happy/200/200" 
            alt="Referral" 
            className="absolute bottom-0 right-0 w-24 h-24 object-cover rounded-tl-3xl opacity-40"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* Services Grid */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-6">Services</h3>
        <div className="grid grid-cols-4 gap-4 sm:gap-8">
          {services.map((service, idx) => (
            <Link 
              key={idx} 
              to={service.path}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                service.color
              )}>
                <service.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-gray-600 text-center">
                {service.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
        <h3 className="text-emerald-800 font-bold mb-2 uppercase text-xs tracking-wider">Important Notification</h3>
        <p className="text-emerald-700 text-sm leading-relaxed">
          Please, don't send Airtel Awoof and Gifting to any number owing Airtel. It will not deliver and you will not be refunded. Thank you for choosing Oplug.
        </p>
      </div>

      {/* Help Section */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6">
        <h3 className="text-emerald-800 font-bold mb-4">Need Help?</h3>
        <div className="flex flex-wrap gap-3">
          <a href={`tel:${settings?.supportPhone}`} className="bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-bold">Call us</a>
          <a href={`https://wa.me/${settings?.supportPhone}`} target="_blank" rel="noreferrer" className="bg-red-500 text-white px-6 py-2 rounded-xl text-sm font-bold">Whatsapp us</a>
          <a href="https://chat.whatsapp.com/your-group-link" target="_blank" rel="noreferrer" className="bg-yellow-500 text-white px-6 py-2 rounded-xl text-sm font-bold">Whatsapp Group</a>
          <a href={`mailto:${settings?.supportEmail}`} className="bg-cyan-500 text-white px-6 py-2 rounded-xl text-sm font-bold">Email us</a>
        </div>
      </div>
    </div>
  );
}
