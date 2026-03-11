import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  Grid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

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
  { name: 'Scheduled Purchases', path: '/scheduled-purchases', icon: Clock },
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
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

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

          <nav className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
            <div className="space-y-1.5">
              <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Main Menu</p>
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group",
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

              <div className="h-px bg-white/5 my-6 mx-4" />
              <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Account & Help</p>
              
              {secondaryItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group",
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
              
              {profile?.isAdmin && (
                <>
                  <div className="h-px bg-white/5 my-6 mx-4" />
                  <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Administration</p>
                  <Link
                    to="/admin"
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 group",
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
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {profile?.fullName?.charAt(0) || profile?.username?.charAt(0)}
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
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold">{profile?.fullName || profile?.username}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{profile?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
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
