import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function ReferAndEarn() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://oplug.vercel.app/signup?ref=OBA";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
        <h2 className="text-2xl font-bold">Refer and Earn</h2>
        <div className="mt-4 flex justify-between items-end">
          <div>
            <p className="text-xs opacity-80 uppercase tracking-wider">Earnings</p>
            <p className="text-2xl font-bold">₦0.00</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80 uppercase tracking-wider">Total Referrals</p>
            <p className="text-2xl font-bold">1</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">How it Works</h3>
        <div className="space-y-4 text-sm text-gray-600">
          <p>Invite your friends and family to join. You'll earn a bonus every time they make a data transaction.</p>
          <p>Plus, get a <span className="font-bold text-blue-700">₦100</span> bonus when any of your referrals complete transactions worth <span className="font-bold text-blue-700">₦1,000</span> or more for the first time.</p>
          <p className="font-medium">Start referring and watch your earnings grow!</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
        <p className="text-amber-800 text-sm">
          Please verify your account email to enable you refer and withdraw your funds easily... <button className="font-bold underline">Verify Now</button>
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold mb-4">Referral Link</h3>
        <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <span className="text-xs text-gray-500 truncate flex-1">{referralLink}</span>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="font-bold mb-4">Recent Referrals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Id</th>
                <th className="px-4 py-3">Names</th>
                <th className="px-4 py-3">Earning</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-4">1</td>
                <td className="px-4 py-4">Philip Yakubu</td>
                <td className="px-4 py-4">₦0</td>
                <td className="px-4 py-4">06-03-2026 12:15:05 PM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
