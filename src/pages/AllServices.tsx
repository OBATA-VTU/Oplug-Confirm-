import React from 'react';
import { 
  Smartphone, Wifi, Tv, Zap, GraduationCap, 
  ShoppingCart, Repeat, Gift, Landmark, 
  ChevronRight, ArrowRight, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

const serviceGroups = [
  {
    title: 'Telecom & Utilities',
    services: [
      { name: 'Airtime Topup', description: 'Instant airtime for all networks', icon: Smartphone, path: '/airtime', color: 'bg-emerald-50 text-emerald-700' },
      { name: 'Data Bundles', description: 'Cheap data plans for browsing', icon: Wifi, path: '/data', color: 'bg-blue-50 text-blue-700' },
      { name: 'Cable TV', description: 'DStv, GOtv & Startimes', icon: Tv, path: '/cable', color: 'bg-purple-50 text-purple-700' },
      { name: 'Electricity', description: 'Prepaid & Postpaid bills', icon: Zap, path: '/electricity', color: 'bg-amber-50 text-amber-700' },
    ]
  },
  {
    title: 'Digital Services',
    services: [
      { name: 'Education Pins', description: 'WAEC, NECO & JAMB pins', icon: GraduationCap, path: '/education', color: 'bg-indigo-50 text-indigo-700' },
      { name: 'SMM Booster', description: 'Social media growth tools', icon: ShoppingCart, path: '/smm', color: 'bg-pink-50 text-pink-700' },
      { name: 'Gift Cards', description: 'Buy & Sell gift cards', icon: Gift, path: '/giftcard', color: 'bg-rose-50 text-rose-700' },
    ]
  },
  {
    title: 'Financial Services',
    services: [
      { name: 'P2P Transfer', description: 'Send money to Oplug users', icon: Repeat, path: '/transfer', color: 'bg-teal-50 text-teal-700' },
      { name: 'Crypto Exchange', description: 'Buy & Sell cryptocurrencies', icon: Landmark, path: '/crypto', color: 'bg-orange-50 text-orange-700' },
    ]
  }
];

export default function AllServices() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredGroups = serviceGroups.map(group => ({
    ...group,
    services: group.services.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.services.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">All Services</h1>
          <p className="text-gray-500 font-medium">Explore everything Oplug has to offer.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-700 transition-colors" />
          <input 
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-12">
        {filteredGroups.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4">{group.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.services.map((service, sIdx) => (
                <motion.div
                  key={sIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sIdx * 0.05 }}
                >
                  <Link 
                    to={service.path}
                    className="flex items-start gap-5 p-6 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all group"
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", service.color)}>
                      <service.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-gray-900">{service.name}</p>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-700 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 leading-relaxed">{service.description}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold">No services found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
