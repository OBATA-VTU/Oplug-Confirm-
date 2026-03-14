import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Smartphone, Wifi, Tv, Zap, GraduationCap, ShoppingCart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

const categories = [
  { id: 'all', name: 'All Services', icon: Filter },
  { id: 'airtime', name: 'Airtime', icon: Smartphone },
  { id: 'data', name: 'Data', icon: Wifi },
  { id: 'cable', name: 'Cable TV', icon: Tv },
  { id: 'electricity', name: 'Electricity', icon: Zap },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'smm', name: 'SMM Booster', icon: ShoppingCart },
];

export default function Pricing() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [prices, setPrices] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Prices Config
        const snap = await getDoc(doc(db, 'settings', 'prices'));
        if (snap.exists()) {
          setPrices(snap.data());
        }

        // Fetch Manual Services
        const servicesSnap = await getDoc(doc(db, 'settings', 'services'));
        let allServices = servicesSnap.exists() ? (servicesSnap.data().list || []) : [];

        // Fetch Synced VTU Services
        const vtuSnap = await getDocs(collection(db, 'vtu_services'));
        const vtuServices = vtuSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.serviceID || data.id,
            name: data.name,
            category: data.category || 'data',
            basePrice: data.amount || data.price || 0,
            duration: data.validity || '30 Days'
          };
        });

        // Fetch Synced SMM Services
        const smmSnap = await getDocs(collection(db, 'smm_services'));
        const smmServices = smmSnap.docs.map(doc => {
          const data = doc.data();
          return {
            id: data.service || data.id,
            name: data.name,
            category: 'smm',
            basePrice: data.rate || 0,
            duration: 'Instant'
          };
        });

        setServices([...allServices, ...vtuServices, ...smmServices]);
      } catch (err) {
        console.error('Error fetching pricing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculatePrice = (base: number, category: string, type: 'smart' | 'reseller') => {
    if (!prices) return base;
    const config = prices[category] || { markup: 0, resellerDiscount: 0 };
    
    let price = base;
    if (category === 'cable' || category === 'electricity' || category === 'education') {
      price = base + config.markup;
      if (type === 'reseller') {
        price -= config.resellerDiscount;
      }
    } else {
      price = base * (1 + config.markup / 100);
      if (type === 'reseller') {
        price = price * (1 - config.resellerDiscount / 100);
      }
    }
    return Math.ceil(price);
  };

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-blue-700 pt-24 pb-32 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
          >
            Service Pricing
          </motion.h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Transparent pricing for all our services. Find the best rates for data, airtime, and more.
          </p>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-[60%] h-[200%] bg-white/10 rounded-full blur-[120px] rotate-12" />
      </div>

      <div className="container mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100/50 border border-gray-100 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                    activeCategory === cat.id 
                      ? "bg-blue-700 text-white shadow-lg shadow-blue-200" 
                      : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
            <div className="relative w-full lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search service or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Pricing Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Service Name</th>
                  <th className="px-8 py-6">Category</th>
                  <th className="px-8 py-6 text-blue-600">{prices?.smartUserLabel || 'Smart User'}</th>
                  <th className="px-8 py-6 text-emerald-600">{prices?.resellerLabel || 'Reseller'}</th>
                  <th className="px-8 py-6">Validity</th>
                  <th className="px-8 py-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredServices.map((service, idx) => (
                  <motion.tr 
                    key={service.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-gray-900">{service.name}</p>
                      <p className="text-[10px] font-mono text-gray-400">{service.id}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-blue-700">₦{calculatePrice(service.basePrice, service.category, 'smart').toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-emerald-700">₦{calculatePrice(service.basePrice, service.category, 'reseller').toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-gray-500 font-medium">{service.duration}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 text-gray-400">
                        <Search className="w-12 h-12 opacity-20" />
                        <p className="text-lg font-black">No services found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border border-blue-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-xl font-black text-blue-900">Reseller Pricing Available</h4>
            <p className="text-blue-700 leading-relaxed">
              Are you a heavy user or a business owner? Upgrade to our <strong>Reseller</strong> or <strong>API</strong> plan to enjoy even lower rates across all services.
            </p>
          </div>
          <Link to="/signup" className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.05] active:scale-[0.95]">
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
}
