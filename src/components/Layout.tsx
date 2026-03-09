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
  ChevronDown,
  GraduationCap,
  Repeat,
  Wallet,
  ShoppingCart,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Fund Wallet', path: '/fund', icon: Wallet },
  { name: 'Buy Airtime', path: '/airtime', icon: Phone },
  { name: 'Buy Data', path: '/data', icon: Wifi },
  { name: 'Cable TV', path: '/cable', icon: Tv },
  { name: 'Electricity', path: '/electricity', icon: Zap },
  { name: 'Education Pin', path: '/education', icon: GraduationCap },
  { name: 'SMM Booster', path: '/smm', icon: ShoppingCart },
  { name: 'P2P Transfer', path: '/transfer', icon: Repeat },
  { name: 'History', path: '/history', icon: History },
  { name: 'Refer & Earn', path: '/refer', icon: Users },
  { name: 'Gift Card', path: '/giftcard', icon: Gift },
  { name: 'Developer API', path: '/developer', icon: Code },
  { name: 'Support', path: '/support', icon: Headphones },
  { name: 'Profile', path: '/profile', icon: User },
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
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold text-blue-700">OPLUG</span>
            </Link>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    location.pathname === item.path 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              {profile?.isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    location.pathname.startsWith('/admin') 
                      ? "bg-red-50 text-red-700" 
                      : "text-red-600 hover:bg-red-50"
                  )}
                >
                  <ShieldAlert className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen flex flex-col">
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
                <p className="text-xs font-semibold">{profile?.displayName}</p>
                <p className="text-[10px] text-gray-500">{profile?.package}</p>
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
