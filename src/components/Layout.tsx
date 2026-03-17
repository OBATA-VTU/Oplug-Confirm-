import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Phone, 
  Wifi, 
  Tv, 
  Zap, 
  History, 
  Users, 
  Gift, 
  Code, 
  Headphones, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Clock,
  ChevronDown,
  GraduationCap,
  Repeat,
  Wallet,
  ShoppingCart,
  ShieldAlert,
  Shield,
  Grid,
  CheckCircle2,
  Info,
  AlertCircle,
  TrendingUp,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';

import Logo from './Logo';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'All Services', path: '/services', icon: Grid },
  { name: 'Fund Wallet', path: '/fund', icon: Wallet },
  { name: 'Buy Airtime', path: '/airtime', icon: Phone },
  { name: 'Buy Data', path: '/data', icon: Wifi },
  { name: 'Cable TV', path: '/cable', icon: Tv },
  { name: 'Electricity', path: '/electricity', icon: Zap },
  { name: 'Education Pin', path: '/education', icon: GraduationCap },
  { name: 'SMM Booster', path: '/smm', icon: ShoppingCart },
  { name: 'P2P Transfer', path: '/transfer', icon: Repeat },
  { name: 'History', path: '/history', icon: History },
];

const secondaryItems = [
  { name: 'Profile Settings', path: '/profile', icon: User },
  { name: 'Refer & Earn', path: '/refer', icon: Users },
  { name: 'Developer API', path: '/developer', icon: Code },
  { name: 'Support Center', path: '/support', icon: Headphones },
];

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout, user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A0A] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <Link to="/dashboard">
              <Logo variant="white" className="scale-110 origin-left" />
            </Link>
            <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide">
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Main Menu</p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                    location.pathname === item.path 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    location.pathname === item.path ? "text-white" : "text-white/40 group-hover:text-white"
                  )} />
                  {item.name}
                </Link>
              ))}

              {profile?.role === 'reseller' && (
                <Link
                  to="/reseller-dashboard"
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group mt-1",
                    location.pathname === '/reseller-dashboard' 
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                      : "text-emerald-400/60 hover:bg-emerald-500/10 hover:text-emerald-400"
                  )}
                >
                  <TrendingUp className="w-5 h-5" />
                  Reseller Dashboard
                </Link>
              )}

              {profile?.role !== 'reseller' && profile?.role !== 'admin' && (
                <Link
                  to="/upgrade"
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group mt-1",
                    location.pathname === '/upgrade' 
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" 
                      : "text-amber-400/60 hover:bg-amber-500/10 hover:text-amber-400"
                  )}
                >
                  <Star className="w-5 h-5" />
                  Upgrade Account
                </Link>
              )}

              <div className="h-px bg-white/5 my-4 mx-4" />
              <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Account & Help</p>
              
              {secondaryItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                    location.pathname === item.path 
                      ? "bg-white/10 text-white shadow-lg" 
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    location.pathname === item.path ? "text-white" : "text-white/40 group-hover:text-white"
                  )} />
                  {item.name}
                </Link>
              ))}
              
              {profile?.role === 'admin' && (
                <>
                  <div className="h-px bg-white/5 my-4 mx-4" />
                  <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Administration</p>
                  <Link
                    to="/admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
                      location.pathname.startsWith('/admin') 
                        ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
                        : "text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                    )}
                  >
                    <ShieldAlert className="w-5 h-5" />
                    Admin Panel
                  </Link>
                </>
              )}
            </div>
          </nav>

          <div className="p-6 border-t border-white/5">
            <div className="flex items-center justify-center gap-6 mb-6">
              <Link to="/terms" className="text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest">Terms</Link>
              <Link to="/privacy" className="text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest">Privacy</Link>
              <Link to="/contact" className="text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-widest">Contact</Link>
            </div>
            <div className="bg-white/5 rounded-[2rem] p-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile?.fullName?.charAt(0) || profile?.username?.charAt(0)
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate">{profile?.fullName || profile?.username}</p>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-bold">{profile?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-red-500/10 text-red-400 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
            <p className="text-[10px] text-center text-white/20 font-medium">Version 2.4.0 • Oplug Tech</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-bottom border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen) markAllAsRead();
                }}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wider">
                          {notifications.length} Total
                        </span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div key={notif.id} className={cn(
                              "p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3",
                              !notif.read && "bg-blue-50/30"
                            )}>
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                notif.type === 'success' ? "bg-emerald-100 text-emerald-600" :
                                notif.type === 'error' ? "bg-red-100 text-red-600" :
                                "bg-blue-100 text-blue-600"
                              )}>
                                {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                 notif.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
                                 <Info className="w-5 h-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 mb-0.5">{notif.title}</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed">{notif.message}</p>
                                <p className="text-[9px] text-gray-400 mt-2 font-medium">
                                  {notif.createdAt?.toDate ? new Date(notif.createdAt.toDate()).toLocaleString() : 'Just now'}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center">
                            <Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <Link 
                        to="/profile/notifications" 
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block p-4 text-center text-xs font-bold text-blue-600 hover:bg-gray-50 transition-colors"
                      >
                        View All Notifications
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <div 
                className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer group" 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-600 transition-all">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold group-hover:text-blue-600 transition-colors">{profile?.fullName || profile?.username}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">{profile?.role}</p>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all", isProfileOpen && "rotate-180")} />
              </div>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Account</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{profile?.email}</p>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            navigate('/profile');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          My Profile
                        </button>
                        <button 
                          onClick={() => {
                            navigate('/history');
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                          <History className="w-4 h-4 text-blue-600" />
                          Transactions
                        </button>
                        <div className="h-px bg-gray-50 my-2" />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="p-8 text-center text-sm text-gray-500 border-t border-gray-100">
          <p>Copyright © 2022 - {new Date().getFullYear()} Oplug. All rights reserved</p>
        </footer>
      </main>
    </div>
  );
}
