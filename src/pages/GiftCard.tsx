import { useState } from 'react';
import { Gift, Ticket, History } from 'lucide-react';

export default function GiftCard() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold mb-6">Gift Card</h2>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold mb-2">Gift Card</h3>
        <p className="text-xs text-gray-500 mb-6">
          Gift Cards allow you to send or receive credit easily. You can generate a gift card for others or redeem one to top up your balance.
        </p>
        
        <div className="space-y-3">
          <button className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
            <Gift className="w-5 h-5" />
            Generate Gift Card
          </button>
          <button className="w-full bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
            <Ticket className="w-5 h-5" />
            Redeem Gift Card
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <h3 className="font-bold mb-4">Generated Gift Cards</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            Show 
            <select className="bg-gray-50 border border-gray-200 rounded px-1 py-1">
              <option>10</option>
              <option>25</option>
            </select>
            entries
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            Search:
            <input type="text" className="bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-4 py-3">Trx Id</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-4">1</td>
                <td className="px-4 py-4 font-mono text-blue-700">OPL-2D60-40DF</td>
                <td className="px-4 py-4">₦500</td>
                <td className="px-4 py-4">
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-bold">redeemed</span>
                </td>
                <td className="px-4 py-4">27-01-2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
