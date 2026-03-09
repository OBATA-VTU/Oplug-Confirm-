import { useState } from 'react';
import { Search, Filter, Download } from 'lucide-react';

export default function History() {
  const [filter, setFilter] = useState('All');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center gap-2">
          <button className="bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-blue-800">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by transaction ID, phone number..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
          >
            <option>All</option>
            <option>Airtime</option>
            <option>Data</option>
            <option>Cable</option>
            <option>Electricity</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">TRX-782934{i}</td>
                  <td className="px-6 py-4 font-medium">MTN Data</td>
                  <td className="px-6 py-4 text-gray-500">0806677880{i} - 1GB SME</td>
                  <td className="px-6 py-4 font-bold">₦250.00</td>
                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">Successful</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">2026-03-08 14:20</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
