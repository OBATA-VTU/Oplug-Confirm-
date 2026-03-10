import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  Book, Code, Smartphone, Wifi, Tv, Zap, 
  GraduationCap, Shield, Terminal, Play, 
  ChevronRight, ArrowLeft, Search, Copy, Check,
  ShoppingCart, Landmark, List
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Logo from '../../components/Logo';

const navItems = [
  { name: 'Introduction', icon: Book, path: '/developer/docs' },
  { name: 'Authentication', icon: Shield, path: '/developer/docs/auth' },
  { name: 'Services API', icon: List, path: '/developer/docs/services' },
  { name: 'Airtime API', icon: Smartphone, path: '/developer/docs/airtime' },
  { name: 'Data API', icon: Wifi, path: '/developer/docs/data' },
  { name: 'Cable TV API', icon: Tv, path: '/developer/docs/cable' },
  { name: 'Electricity API', icon: Zap, path: '/developer/docs/electricity' },
  { name: 'Education API', icon: GraduationCap, path: '/developer/docs/education' },
  { name: 'SMM Booster API', icon: ShoppingCart, path: '/developer/docs/smm' },
  { name: 'Crypto API', icon: Landmark, path: '/developer/docs/crypto' },
  { name: 'Sandbox / Testing', icon: Play, path: '/developer/docs/sandbox' },
];

export default function ApiDocsLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/">
            <Logo className="scale-90" />
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-widest">
            <Code className="w-4 h-4" />
            API Documentation
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search documentation..." 
              className="bg-gray-50 border border-gray-100 rounded-xl pl-11 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            />
          </div>
          <Link to="/dashboard" className="text-sm font-bold text-blue-700 hover:underline">Back to Dashboard</Link>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-72 border-r border-gray-100 overflow-y-auto sticky top-20 h-[calc(100vh-5rem)] p-6 hidden lg:block">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-500 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
