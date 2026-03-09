import { useState, useEffect } from 'react';
import { smmService } from '../services/apiService';
import { Search, ShoppingCart, Info, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

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
          setServices(response);
          setFilteredServices(response);
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
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6">Social Media Booster</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <motion.div 
                key={service.service}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-3xl p-5 hover:border-blue-500 transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                    {service.category}
                  </span>
                  <span className="text-sm font-bold text-gray-900">₦{service.rate}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-4 line-clamp-2">{service.name}</h3>
                
                <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Min: {service.min}
                  </div>
                  <div className="flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Max: {service.max}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedService(service)}
                  className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-2xl text-xs hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Order Now
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold">New Order</h3>
              <button 
                onClick={() => setSelectedService(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-700 mb-1">{selectedService.name}</p>
                <p className="text-[10px] text-blue-600">Rate: ₦{selectedService.rate} per 1,000</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Link</label>
                <input 
                  type="url"
                  placeholder="https://instagram.com/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input 
                  type="number"
                  placeholder={`Min: ${selectedService.min}, Max: ${selectedService.max}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Total Price:</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₦{((Number(selectedService.rate) / 1000) * Number(quantity || 0)).toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={handleOrder}
                  disabled={ordering}
                  className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50"
                >
                  {ordering ? 'Processing...' : 'Confirm Order'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
