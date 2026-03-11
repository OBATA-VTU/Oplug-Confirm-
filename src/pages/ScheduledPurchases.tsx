import { useState, useEffect } from 'react';
import { Calendar, Clock, Trash2, Plus, AlertCircle, CheckCircle2, Receipt } from 'lucide-react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function ScheduledPurchases() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, 'scheduled_purchases'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        setSchedules(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error('Error fetching schedules:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled purchase?')) return;
    try {
      await deleteDoc(doc(db, 'scheduled_purchases', id));
      setSchedules(prev => prev.filter(s => s.id !== id));
      setMessage({ type: 'success', text: 'Schedule cancelled successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel schedule' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Scheduled Purchases</h1>
          <p className="text-gray-500 font-medium">Manage your recurring and future digital payments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-2xl flex items-center gap-3 font-bold text-sm",
            message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
          )}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl mb-6" />
              <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-4" />
              <div className="h-3 bg-gray-100 rounded-full w-1/2" />
            </div>
          ))
        ) : schedules.length > 0 ? (
          schedules.map((schedule) => (
            <motion.div 
              key={schedule.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-7 h-7 text-blue-600" />
                  </div>
                  <button 
                    onClick={() => handleDelete(schedule.id)}
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{schedule.type}</h3>
                    <p className="text-sm font-bold text-gray-400 mt-1">{schedule.details}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-50 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</span>
                      <span className="text-sm font-black text-gray-900">₦{schedule.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequency</span>
                      <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                        {schedule.frequency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Next Run</span>
                      <span className="text-sm font-bold text-gray-700">
                        {new Date(schedule.nextRun).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors" />
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
            <div className="max-w-xs mx-auto">
              <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <Calendar className="w-12 h-12 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-3">No Scheduled Purchases</h3>
              <p className="text-sm text-gray-400 font-medium mb-8 leading-relaxed">
                Automate your recurring bills and never worry about running out of data or airtime again.
              </p>
              <button className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" />
                Create First Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
