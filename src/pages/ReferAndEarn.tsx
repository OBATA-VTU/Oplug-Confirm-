import { useState } from 'react';
import { Copy, Check, Users, Gift, TrendingUp, ShieldCheck, ChevronRight, Share2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function ReferAndEarn() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Dynamic referral link based on username
  const referralLink = `https://oplug.vercel.app/signup?ref=${profile?.username || 'OBA'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Total Referrals', value: '1', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Earnings', value: '₦0.00', icon: Gift, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Bonus', value: '₦0.00', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Refer & Earn</h1>
          <p className="text-gray-500 font-medium">Invite friends and earn rewards on every transaction.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Gift className="w-5 h-5 text-blue-700" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bonus Rate</p>
            <p className="text-sm font-black text-gray-900">Up to ₦500</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:shadow-blue-500/5 transition-all"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-7 h-7", stat.color)} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Referral Link Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Your Referral Link</h3>
            
            <div className="space-y-6 relative z-10">
              <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4 group">
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Copy Link</p>
                  <p className="text-sm font-bold text-gray-700 truncate">{referralLink}</p>
                </div>
                <button 
                  onClick={handleCopy}
                  className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 hover:text-blue-700 hover:border-blue-700 transition-all shadow-sm active:scale-95"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Link
                </button>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-6 flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-900 mb-1">Account Verification</p>
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                Please verify your account email to enable you refer and withdraw your funds easily. 
                <button className="ml-1 underline decoration-2 underline-offset-4 hover:text-amber-950 transition-colors">Verify Now</button>
              </p>
            </div>
          </div>
        </div>

        {/* How it Works Card */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">How it Works</h3>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 font-black shrink-0">1</div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-1">Invite Friends</p>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">Share your unique referral link with friends and family via social media or direct message.</p>
              </div>
            </div>
            
            <div className="flex gap-6">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-black shrink-0">2</div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-1">They Register & Transact</p>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">When they sign up and complete their first transaction of at least ₦1,000.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700 font-black shrink-0">3</div>
              <div>
                <p className="text-sm font-black text-gray-900 mb-1">You Get Paid</p>
                <p className="text-xs font-bold text-gray-500 leading-relaxed">Instantly receive ₦100 bonus plus a percentage of every data transaction they make forever!</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Recent Referrals</h3>
          <button className="text-[10px] font-black text-blue-700 uppercase tracking-widest hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">User</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Earning</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date Joined</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-700 font-black">PY</div>
                    <div>
                      <p className="text-sm font-black text-gray-900">Philip Yakubu</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: #REF001</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-gray-900">₦0.00</span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">06-03-2026</span>
                    <span className="text-[10px] font-bold text-gray-400">12:15 PM</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    Active
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
