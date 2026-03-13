import { useState, useEffect } from 'react';
import { 
  Wallet, Users, ArrowUpRight, History, Phone, Wifi, Tv, Zap, 
  GraduationCap, Repeat, Gift, ShoppingCart, Copy, Megaphone, 
  Landmark, Plus, ArrowRightLeft, ShieldCheck, TrendingUp, 
  ChevronRight, CreditCard, Smartphone, Bell, ShieldAlert, User
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const services = [
  { name: 'Airtime', icon: Smartphone, path: '/airtime', color: 'bg-[#E8F5E9] text-[#2E7D32]' },
  { name: 'Data', icon: Wifi, path: '/data', color: 'bg-[#E3F2FD] text-[#1565C0]' },
  { name: 'TV', icon: Tv, path: '/cable', color: 'bg-[#F3E5F5] text-[#7B1FA2]' },
  { name: 'Electricity', icon: Zap, path: '/electricity', color: 'bg-[#FFF3E0] text-[#E65100]' },
  { name: 'Edu Pin', icon: GraduationCap, path: '/education', color: 'bg-[#E1F5FE] text-[#0277BD]' },
  { name: 'SMM Booster', icon: ShoppingCart, path: '/smm', color: 'bg-[#F1F8E9] text-[#33691E]' },
  { name: 'P2P', icon: Repeat, path: '/transfer', color: 'bg-[#E0F2F1] text-[#00695C]' },
  { name: 'Gift Card', icon: Gift, path: '/giftcard', color: 'bg-[#FCE4EC] text-[#C2185B]' },
  { name: 'Crypto', icon: Landmark, path: '/crypto', color: 'bg-[#FFF8E1] text-[#FF8F00]' },
];

export default function Dashboard() {
  const { profile, user } = useAuth();
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

  const isProfileIncomplete = !profile?.fullName || !profile?.username || !profile?.phone || !profile?.virtualAccount;
  const isReseller = profile?.role?.toLowerCase() === 'reseller';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Welcome Message */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Welcome, <span className="text-blue-700">{profile?.fullName || profile?.username || 'User'}</span>
          </h1>
          <p className="text-gray-500 font-medium">What would you like to do today?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account Status</p>
            <p className="text-sm font-black text-emerald-600 uppercase tracking-wider">{profile?.role || 'User'}</p>
          </div>
          <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center shadow-sm">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      {!isReseller && profile?.role !== 'admin' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-blue-100"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-xl font-black">Become a Reseller</h4>
                <p className="text-sm text-blue-100 font-medium">Get massive discounts on all services and boost your profit.</p>
              </div>
            </div>
            <Link 
              to="/upgrade" 
              className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-transform active:scale-95 whitespace-nowrap"
            >
              Upgrade Now
            </Link>
          </div>
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </motion.div>
      )}

      {/* Profile Completion Alert */}
      {isProfileIncomplete && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-50 border border-amber-100 rounded-3xl p-5 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-black text-amber-900 mb-1">Complete Your Profile</h4>
            <p className="text-xs text-amber-800 leading-relaxed mb-3">
              Your profile is incomplete. Please update your details and ensure your virtual account is generated to enjoy full access.
              {!profile?.virtualAccount && (
                <span className="flex items-center gap-1 mt-1 font-bold text-red-600">
                  <ShieldAlert className="w-3 h-3" />
                  Virtual account not found. Please contact support or try creating a new account if this persists.
                </span>
              )}
            </p>
            <Link to="/profile" className="text-xs font-black text-amber-900 underline underline-offset-4">
              Update Profile Now
            </Link>
          </div>
        </motion.div>
      )}

      {/* Ancient Greek Mythology Gold Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-[3rem] p-10 text-white overflow-hidden shadow-2xl shadow-amber-200/50 bg-[#1A1A1A] border border-amber-500/20 group"
      >
        {/* Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#BF953F] via-[#FCF6BA] to-[#B38728] opacity-95 mix-blend-overlay" />
        
        {/* Greek Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30zM0 0c16.569 0 30 13.431 30 30 0 16.569-13.431 30-30 30V0z' fill='%23000000' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3 bg-black/30 px-5 py-2.5 rounded-2xl backdrop-blur-xl border border-white/10">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-100">Oplug Treasury</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black/30 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:rotate-12 transition-transform">
                <Wallet className="w-6 h-6 text-amber-200" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black text-amber-100/70 uppercase tracking-[0.4em]">Available Wealth</p>
              <div className="h-px flex-1 bg-amber-100/20" />
            </div>
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-amber-300 drop-shadow-md">₦</span>
              <h2 className="text-7xl font-black tracking-tighter text-white drop-shadow-2xl">
                {profile?.walletBalance?.toLocaleString() || '0.00'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-14">
            <Link to="/fund" className="flex items-center justify-center gap-3 bg-white text-amber-950 py-5 rounded-[2rem] font-black text-sm shadow-2xl hover:scale-[1.02] transition-transform active:scale-[0.98] group/btn">
              <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
              Fund Wallet
            </Link>
            <Link to="/transfer" className="flex items-center justify-center gap-3 bg-black/40 text-white py-5 rounded-[2rem] font-black text-sm backdrop-blur-xl border border-white/10 hover:bg-black/50 transition-all active:scale-[0.98]">
              <ArrowRightLeft className="w-5 h-5" />
              Transfer
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 border-[30px] border-amber-400/5 rounded-full" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 border-[20px] border-amber-300/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </motion.div>

      {/* Virtual Account Quick Info */}
      {profile?.virtualAccount && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-3xl p-5 flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Landmark className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{profile.virtualAccount.bank_name}</p>
              <p className="text-lg font-black text-gray-900">{profile.virtualAccount.account_number}</p>
            </div>
          </div>
          <button 
            onClick={() => copyToClipboard(profile.virtualAccount!.account_number)}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors group"
          >
            <Copy className="w-5 h-5 text-gray-400 group-active:text-blue-600" />
          </button>
        </motion.div>
      )}

      {/* Announcement Marquee */}
      {settings?.announcement && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-3 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-1.5 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-bold text-orange-800 whitespace-nowrap animate-marquee">
                {settings.announcement} <span className="mx-4 text-orange-300">|</span> {settings.announcement}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Services Grid - PalmPay Style */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-gray-900">Services</h3>
          <Link to="/services" className="text-blue-600 text-sm font-bold flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-y-10 gap-x-4">
          {services.map((service, idx) => (
            <Link 
              key={idx} 
              to={service.path}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={cn(
                "w-16 h-16 rounded-[1.75rem] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-active:scale-95",
                service.color
              )}>
                <service.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-gray-600 text-center group-hover:text-gray-900">
                {service.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Promotions / Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2">Refer & Earn</h4>
            <p className="text-sm text-white/80 mb-4">Get ₦{settings?.referralBonus || '500'} for every friend you invite.</p>
            <Link to="/refer" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md transition-all">
              Invite Now <ArrowRightLeft className="w-3 h-3 rotate-45" />
            </Link>
          </div>
          <Users className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden group cursor-pointer">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2">SMM Booster</h4>
            <p className="text-sm text-white/80 mb-4">Boost your social media presence instantly.</p>
            <Link to="/smm" className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md transition-all">
              Get Started <TrendingUp className="w-3 h-3" />
            </Link>
          </div>
          <ShoppingCart className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-gray-900">Recent Activity</h3>
          <Link to="/history" className="text-gray-400 text-sm font-bold hover:text-blue-600">See History</Link>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12 text-gray-400 flex-col gap-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <History className="w-8 h-8 opacity-20" />
            </div>
            <p className="text-sm font-bold">No recent transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
