import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Calendar,
  Download,
  Wifi,
  Phone,
  Tv,
  Zap,
  GraduationCap,
  ChevronRight,
  Search,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export default function ResellerDashboard() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      where('status', '==', 'success'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = {
    totalSales: transactions.reduce((acc, tx) => acc + (tx.amount || 0), 0),
    totalProfit: transactions.reduce((acc, tx) => acc + (tx.profit || 0), 0),
    salesCount: transactions.length,
    avgProfit: transactions.length > 0 ? transactions.reduce((acc, tx) => acc + (tx.profit || 0), 0) / transactions.length : 0
  };

  const serviceBreakdown = transactions.reduce((acc: any, tx) => {
    const service = tx.service || 'other';
    if (!acc[service]) {
      acc[service] = { name: service, sales: 0, profit: 0, count: 0 };
    }
    acc[service].sales += tx.amount || 0;
    acc[service].profit += tx.profit || 0;
    acc[service].count += 1;
    return acc;
  }, {});

  const pieData = Object.values(serviceBreakdown).map((s: any) => ({
    name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
    value: s.profit
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const chartData = transactions.slice(0, 20).reverse().map(tx => ({
    date: tx.createdAt?.toDate ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'Now',
    profit: tx.profit || 0,
    sales: tx.amount || 0
  }));

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Reseller Dashboard</h1>
          <p className="text-gray-500 font-medium">Analyze your performance and maximize your earnings.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-100 rounded-2xl p-1 flex shadow-sm">
            {['24h', '7d', '30d', 'All'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black transition-all",
                  timeRange === range ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Sales', value: `₦${stats.totalSales.toLocaleString()}`, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12.5%' },
          { label: 'Total Profit', value: `₦${stats.totalProfit.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8.2%' },
          { label: 'Sales Count', value: stats.salesCount.toLocaleString(), icon: BarChartIcon, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+5.1%' },
          { label: 'Avg. Profit', value: `₦${Math.round(stats.avgProfit).toLocaleString()}`, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+2.4%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-gray-900">Profit Overview</h3>
            <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-xs font-bold outline-none">
              <option>Daily Profit</option>
              <option>Monthly Profit</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-8">Profit by Service</h3>
          <div className="h-[250px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
            {Object.values(serviceBreakdown).map((s: any, index) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold text-gray-600 capitalize">{s.name}</span>
                </div>
                <span className="text-xs font-black text-gray-900">₦{s.profit.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sales Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-900">Recent Sales</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-xs font-bold outline-none w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Service</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Profit</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        tx.service === 'data' ? "bg-blue-50 text-blue-600" :
                        tx.service === 'airtime' ? "bg-emerald-50 text-emerald-600" :
                        "bg-purple-50 text-purple-600"
                      )}>
                        {tx.service === 'data' ? <Wifi className="w-5 h-5" /> :
                         tx.service === 'airtime' ? <Phone className="w-5 h-5" /> :
                         <ShoppingCart className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-black text-gray-900 capitalize">{tx.service || 'Other'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-gray-600 max-w-xs truncate">{tx.description}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-gray-900">₦{tx.amount?.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-black text-emerald-600">+₦{tx.profit?.toLocaleString() || '0'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-gray-400">
                      {tx.createdAt?.toDate ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-8 border-t border-gray-50 text-center">
          <button className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
