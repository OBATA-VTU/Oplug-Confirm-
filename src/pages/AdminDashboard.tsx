import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, Wallet, ShoppingCart, TrendingUp, ArrowUpRight, Clock, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBalance: 0,
    totalOrders: 0,
    monthlyRevenue: 0,
    recentTransactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalBalance = 0;
        usersSnap.forEach(doc => {
          totalBalance += doc.data().walletBalance || 0;
        });

        const transactionsSnap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')));
        const allTransactions = transactionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        
        const successTransactions = allTransactions.filter(tx => tx.status === 'success');
        const monthlyRevenue = successTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

        setStats({
          totalUsers: usersSnap.size,
          totalBalance,
          totalOrders: allTransactions.length,
          monthlyRevenue,
          recentTransactions: allTransactions.slice(0, 5)
        });
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Balance', value: `₦${stats.totalBalance.toLocaleString()}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Revenue', value: `₦${stats.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <ArrowUpRight className="w-3 h-3" />
                Live
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold">Recent Transactions</h3>
            <Link to="/admin/users" className="text-blue-700 text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentTransactions.map((tx, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">{tx.userEmail}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{tx.service}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">₦{tx.amount?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        tx.status === 'success' ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500">{tx.createdAt?.toDate ? new Date(tx.createdAt.toDate()).toLocaleDateString() : 'N/A'}</p>
                    </td>
                  </tr>
                ))}
                {stats.recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold mb-6">Quick Actions</h3>
          <div className="space-y-4">
            {[
              { label: 'Broadcast Notification', icon: Bell, color: 'bg-blue-50 text-blue-700', link: '/admin/notifications' },
              { label: 'Manage Prices', icon: ShoppingCart, color: 'bg-purple-50 text-purple-700', link: '/admin/prices' },
              { label: 'User Search', icon: Users, color: 'bg-emerald-50 text-emerald-700', link: '/admin/users' },
              { label: 'System Settings', icon: TrendingUp, color: 'bg-orange-50 text-orange-700', link: '/admin/settings' },
            ].map((action, i) => (
              <Link key={i} to={action.link} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 text-left group">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
