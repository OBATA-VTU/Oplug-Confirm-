import { useState, useEffect } from 'react';
import { smmService } from '../services/apiService';
import { Search, ShoppingCart, Info, ExternalLink, Globe, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function SmmServices() {
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Order Form State
  const [selectedService, setSelectedService] = useState<any>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const response = await smmService.getServices();
        if (Array.isArray(response)) {
          const updatedServices = response.map(s => ({
            ...s,
            name: s.name.replace(/Ogaviral/gi, 'Oplug')
          }));
          setServices(updatedServices);
          setFilteredServices(updatedServices);
        }
      } catch (error) {
        console.error('Failed to fetch SMM services', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    let result = services;
    if (selectedCategory !== 'All') {
      result = result.filter(s => s.category === selectedCategory);
    }
    if (searchTerm) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredServices(result);
  }, [searchTerm, selectedCategory, services]);

  const handleOrder = async () => {
    if (!selectedService || !link || !quantity) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    setOrdering(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await smmService.addOrder({
        service: selectedService.service,
        link: link,
        quantity: Number(quantity)
      });

      if (response.order) {
        setMessage({ type: 'success', text: `Order placed successfully! Order ID: ${response.order}` });
        setLink('');
        setQuantity('');
        setSelectedService(null);
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to place order' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'An error occurred' });
    } finally {
      setOrdering(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(services.map(s => s.category)))];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">SMM Booster</h1>
          <p className="text-gray-500 font-medium">Boost your social media presence instantly.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-blue-700" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Services</p>
            <p className="text-sm font-black text-gray-900">{services.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-700 transition-colors" />
            <input 
              type="text"
              placeholder="Search for services (e.g. Instagram Followers)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="lg:w-72">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin" />
            <p className="text-sm font-bold text-gray-400 animate-pulse">Fetching premium services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <motion.div 
                key={service.service}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50/50 border border-gray-100 rounded-[2rem] p-6 hover:border-blue-500/30 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl">
                    {service.category}
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-400">Rate/1k</span>
                    <span className="text-lg font-black text-gray-900">₦{service.rate}</span>
                  </div>
                </div>
                
                <h3 className="text-sm font-black text-gray-800 mb-6 line-clamp-2 leading-relaxed flex-1">
                  {service.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-3 bg-white rounded-2xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Min Order</p>
                    <p className="text-xs font-black text-gray-900">{service.min}</p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-gray-100">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Order</p>
                    <p className="text-xs font-black text-gray-900">{service.max}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedService(service)}
                  className="w-full bg-white border border-gray-200 text-gray-700 font-black py-4 rounded-2xl text-xs group-hover:bg-blue-700 group-hover:text-white group-hover:border-blue-700 group-hover:shadow-lg group-hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Place Order
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">New Order</h3>
                  <p className="text-sm text-gray-500 font-medium">Complete your social booster order</p>
                </div>
                <button 
                  onClick={() => setSelectedService(null)}
                  className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {message.text && (
                <div className={cn(
                  "p-5 rounded-2xl mb-8 flex items-start gap-3",
                  message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                )}>
                  <p className="text-sm font-bold">{message.text}</p>
                </div>
              )}

              <div className="space-y-6">
                <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                  <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-2">Service Selected</p>
                  <p className="text-sm font-black text-blue-900 leading-relaxed mb-3">{selectedService.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white rounded-lg text-[10px] font-black text-blue-700">₦{selectedService.rate}/1k</span>
                    <span className="px-2 py-1 bg-white rounded-lg text-[10px] font-black text-blue-700">Min: {selectedService.min}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Target Link</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="url"
                      placeholder="https://instagram.com/p/..."
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                  <div className="relative">
                    <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="number"
                      placeholder={`Min: ${selectedService.min}, Max: ${selectedService.max}`}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Price</span>
                    <div className="text-right">
                      <span className="text-3xl font-black text-gray-900">
                        ₦{((Number(selectedService.rate) / 1000) * Number(quantity || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={handleOrder}
                    disabled={ordering}
                    className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {ordering ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        Confirm & Pay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
