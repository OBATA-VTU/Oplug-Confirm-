import { useState, useEffect } from 'react';
import { Search, Filter, Download, Receipt, CheckCircle2, XCircle, Clock, ChevronRight, X, Printer, Share2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function History() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState<any>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'transactions'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'All' || tx.type === filter;
    const description = tx.description || tx.details || '';
    const matchesSearch = tx.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatTimestamp = (timestamp: any) => {
    const defaultVal = { date: 'N/A', time: 'N/A', full: 'N/A' };
    if (!timestamp) return defaultVal;
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
        full: date.toLocaleString()
      };
    } catch (e) {
      return defaultVal;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'successful':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'successful':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'failed':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Transaction History</h1>
          <p className="text-gray-500 font-medium">Track and manage all your digital purchases.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-4 h-4 text-blue-600" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row items-center gap-4 bg-gray-50/30">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID, phone number or service..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-5 h-5 text-gray-400 ml-2 hidden md:block" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 md:w-48 bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              <option>All</option>
              <option>Airtime</option>
              <option>Data</option>
              <option>Cable</option>
              <option>Electricity</option>
              <option>SMM</option>
              <option>Funding</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Service</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6">
                      <div className="h-4 bg-gray-100 rounded-full w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-900 font-mono">{tx.id.slice(0, 12)}...</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">{tx.reference || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{tx.type}</p>
                          <p className="text-[10px] font-bold text-gray-400 truncate max-w-[150px]">{tx.description || tx.details}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-gray-900">₦{tx.amount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        getStatusColor(tx.status)
                      )}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900">{formatTimestamp(tx.createdAt).date}</span>
                        <span className="text-[10px] font-bold text-gray-400">{formatTimestamp(tx.createdAt).time}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => setSelectedTx(tx)}
                        className="p-2 bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Receipt className="w-10 h-10 text-gray-200" />
                      </div>
                      <h3 className="text-lg font-black text-gray-900 mb-2">No Transactions Found</h3>
                      <p className="text-sm text-gray-400 font-medium">Your digital journey starts here. Make your first purchase to see it in history.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3rem] max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              {/* Header */}
              <div className="bg-blue-700 p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-blue-700 font-black text-xl">O</span>
                      </div>
                      <span className="text-xl font-black tracking-tighter">OPLUG</span>
                    </div>
                    <h3 className="text-2xl font-black">Transaction Receipt</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedTx(null)}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              </div>

              {/* Body */}
              <div className="p-8 space-y-8">
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg",
                    selectedTx.status.toLowerCase() === 'success' ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                  )}>
                    {getStatusIcon(selectedTx.status)}
                  </div>
                  <h4 className="text-3xl font-black text-gray-900">₦{selectedTx.amount.toLocaleString()}</h4>
                  <p className={cn(
                    "text-xs font-black uppercase tracking-widest mt-2",
                    selectedTx.status.toLowerCase() === 'success' ? "text-emerald-600" : "text-red-600"
                  )}>{selectedTx.status}</p>
                </div>

                <div className="space-y-4 pt-8 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Type</span>
                    <span className="text-sm font-black text-gray-900">{selectedTx.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction ID</span>
                    <span className="text-sm font-black text-gray-900 font-mono">{selectedTx.id.slice(0, 16)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date & Time</span>
                    <span className="text-sm font-black text-gray-900">{formatTimestamp(selectedTx.createdAt).full}</span>
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</span>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm font-bold text-gray-700 leading-relaxed">
                      {selectedTx.description || selectedTx.details}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-8">
                  <button className="flex items-center justify-center gap-2 py-4 bg-gray-50 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button className="flex items-center justify-center gap-2 py-4 bg-blue-700 text-white rounded-2xl font-black text-xs hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thank you for choosing Oplug!</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
