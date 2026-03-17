import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { smmService } from '../services/apiService';
import { 
  Search, ShoppingCart, Globe, Plus, X, 
  Filter, Zap, TrendingUp, Users, Heart, 
  MessageCircle, Play, Eye, Star, CheckCircle2,
  AlertCircle, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import PinModal from '../components/PinModal';
import ProcessingModal from '../components/ProcessingModal';

const CATEGORIES = [
  { id: 'All', name: 'All Services', icon: Globe },
  { id: 'WhatsApp', name: 'WhatsApp', icon: MessageCircle },
  { id: 'Instagram', name: 'Instagram', icon: Heart },
  { id: 'Twitter', name: 'Twitter', icon: TrendingUp },
  { id: 'Facebook', name: 'Facebook', icon: Users },
  { id: 'TikTok', name: 'TikTok', icon: Play },
  { id: 'YouTube', name: 'YouTube', icon: Eye },
  { id: 'Telegram', name: 'Telegram', icon: Zap },
  { id: 'Others', name: 'Others', icon: Star },
];

export default function SmmServices() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Order Form State
  const [selectedService, setSelectedService] = useState<any>(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');

  // PIN & Processing states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');
  const [prices, setPrices] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'prices'));
        if (snap.exists()) {
          setPrices(snap.data());
        }
      } catch (err) {
        console.error('Error fetching prices:', err);
      }
    };
    fetchSettings();
  }, []);

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
        }
      } catch (error) {
        console.error('Failed to fetch SMM services', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    let result = services;
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Others') {
        const knownApps = ['whatsapp', 'instagram', 'twitter', 'gmail', 'spotify', 'facebook', 'tiktok', 'youtube', 'telegram'];
        result = result.filter(s => !knownApps.some(app => s.category.toLowerCase().includes(app) || s.name.toLowerCase().includes(app)));
      } else {
        result = result.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()) || s.name.toLowerCase().includes(selectedCategory.toLowerCase()));
      }
    }
    if (searchTerm) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return result;
  }, [searchTerm, selectedCategory, services]);

  const calculatePrice = (baseRate: number) => {
    if (!prices?.smm) return baseRate;
    const { markup, resellerDiscount } = prices.smm;
    const isReseller = profile?.role?.toLowerCase() === 'reseller';
    
    let price = baseRate * (1 + markup / 100);
    if (isReseller) {
      price = price * (1 - resellerDiscount / 100);
    }
    return Math.ceil(price);
  };

  const handleOrder = async () => {
    if (!selectedService || !link || !quantity) {
      setMessage({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    const unitPrice = calculatePrice(Number(selectedService.rate));
    const totalPrice = (unitPrice / 1000) * Number(quantity);

    if ((profile?.balance || 0) < totalPrice) {
      setMessage({ type: 'error', text: 'Insufficient balance' });
      return;
    }

    if (!profile?.isPinSet) {
      setShowSetupPinModal(true);
      return;
    }

    setShowPinModal(true);
  };

  const executeOrder = async () => {
    setOrdering(true);
    setMessage({ type: '', text: '' });
    setShowProcessing(true);
    setProcessStatus('processing');
    setProcessMessage('Processing your SMM order...');

    try {
      const unitPrice = calculatePrice(Number(selectedService.rate));
      const totalPrice = (unitPrice / 1000) * Number(quantity);

      const response = await smmService.addOrder({
        service: selectedService.service,
        link: link,
        quantity: Number(quantity)
      });

      if (response.order) {
        setProcessStatus('success');
        setProcessMessage(`Order placed successfully! Order ID: ${response.order}`);
        
        if (user) {
          await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            type: 'SMM Order',
            amount: totalPrice,
            status: 'success',
            description: `${selectedService.name} - Qty: ${quantity} for ${link}`,
            reference: response.order.toString(),
            createdAt: serverTimestamp()
          });

          await updateDoc(doc(db, 'users', user.uid), {
            balance: increment(-totalPrice)
          });
        }

        setLink('');
        setQuantity('');
        setSelectedService(null);
      } else {
        setProcessStatus('error');
        setProcessMessage(response.error || 'Failed to place order');
      }
    } catch (error: any) {
      setProcessStatus('error');
      setProcessMessage(error.response?.data?.error || 'An error occurred during order placement');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 px-4">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-blue-700 rounded-[3rem] p-12 text-white shadow-2xl shadow-blue-200">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full -ml-32 -mb-32 blur-3xl" />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <TrendingUp className="w-4 h-4 text-blue-200" />
              <span className="text-[10px] font-black uppercase tracking-widest">Premium SMM Booster</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight">
              Scale Your Social <br />
              <span className="text-blue-200">Presence Instantly</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium max-w-lg">
              Get high-quality followers, likes, views, and engagement across all major social platforms at the best rates.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Stats & Search Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-700 transition-colors" />
            <input 
              type="text"
              placeholder="Search for services (e.g. Instagram Followers)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-2xl pl-16 pr-6 py-5 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-gray-100 flex items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Services</p>
              <p className="text-xl font-black text-gray-900">{services.length}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-100" />
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Balance</p>
            <p className="text-xl font-black text-blue-700">₦{profile?.balance?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex overflow-x-auto pb-4 gap-3 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-xs whitespace-nowrap transition-all border-2",
                isActive 
                  ? "bg-blue-700 border-blue-700 text-white shadow-lg shadow-blue-200 scale-105" 
                  : "bg-white border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400")} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin" />
            <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-700 animate-pulse" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-black text-gray-900">Loading Premium Services</p>
            <p className="text-sm font-medium text-gray-400">Fetching the best rates for you...</p>
          </div>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, index) => (
              <motion.div 
                key={service.service}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-100 transition-colors" />
                
                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="px-4 py-2 bg-blue-50 rounded-xl">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                        {service.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate/1k</p>
                      <p className="text-2xl font-black text-gray-900">₦{calculatePrice(Number(service.rate))}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-black text-gray-800 mb-6 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
                    {service.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Min Order</p>
                      <p className="text-sm font-black text-gray-900">{service.min.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-white transition-colors">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Max Order</p>
                      <p className="text-sm font-black text-gray-900">{service.max.toLocaleString()}</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedService(service)}
                    className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl text-sm hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Place Order
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 font-medium">Try adjusting your search or category filter.</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="mt-8 text-blue-700 font-black text-sm hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Order Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-10 max-w-lg w-full shadow-2xl relative overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full -mr-24 -mt-24 blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <ShoppingCart className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">New Order</h3>
                      <p className="text-sm text-gray-500 font-medium">Boost your presence</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedService(null)}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-2xl transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {message.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "p-5 rounded-2xl mb-8 flex items-start gap-3 border",
                      message.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                    )}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{message.text}</p>
                  </motion.div>
                )}

                <div className="space-y-6">
                  <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Service Details</p>
                    <p className="text-sm font-black text-gray-900 leading-tight mb-4">{selectedService.name}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black text-blue-700 border border-blue-100">₦{calculatePrice(Number(selectedService.rate))}/1k</span>
                      <span className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black text-gray-600 border border-gray-100">Min: {selectedService.min}</span>
                      <span className="px-3 py-1.5 bg-white rounded-xl text-[10px] font-black text-gray-600 border border-gray-100">Max: {selectedService.max}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Link</label>
                    <div className="relative group">
                      <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-700 transition-colors" />
                      <input 
                        type="url"
                        placeholder="https://instagram.com/p/..."
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                    <div className="relative group">
                      <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-700 transition-colors" />
                      <input 
                        type="number"
                        placeholder={`Enter quantity (${selectedService.min} - ${selectedService.max})`}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl pl-14 pr-6 py-4 text-sm font-bold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Payable</p>
                        <p className="text-4xl font-black text-gray-900">
                          ₦{((calculatePrice(Number(selectedService.rate)) / 1000) * Number(quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Delivery</p>
                        <p className="text-sm font-black text-blue-700">Instant - 24h</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleOrder}
                      disabled={ordering}
                      className="w-full bg-blue-700 text-white py-6 rounded-2xl font-black text-sm shadow-2xl shadow-blue-200 hover:bg-blue-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {ordering ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          CONFIRM & PAY NOW
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN Verification Modal */}
      <PinModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={executeOrder}
        correctPin={profile?.transactionPin}
        mode="verify"
        title="Verify Transaction"
        description={`Enter your 5-digit PIN to authorize SMM order for ${selectedService?.name}`}
      />

      {/* Setup PIN Modal */}
      <PinModal 
        isOpen={showSetupPinModal}
        onClose={() => setShowSetupPinModal(false)}
        onSuccess={() => navigate('/profile')}
        mode="verify"
        title="PIN Required"
        description="You need to set a transaction PIN before you can make purchases. Would you like to set it now?"
      />

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={showProcessing}
        onClose={() => setShowProcessing(false)}
        status={processStatus}
        message={processMessage}
      />
    </div>
  );
}
