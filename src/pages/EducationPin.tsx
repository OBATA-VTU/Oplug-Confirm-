import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShoppingCart, Info, ShieldCheck, CheckCircle2, X, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { vtuService } from '../services/apiService';
import PinModal from '../components/PinModal';
import ProcessingModal from '../components/ProcessingModal';

export default function EducationPin() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState('1');
  const [loading, setLoading] = useState(true);
  const [purchasedPins, setPurchasedPins] = useState<any[]>([]);

  // PIN & Processing states
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetupPinModal, setShowSetupPinModal] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [processStatus, setProcessStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [processMessage, setProcessMessage] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await vtuService.getServices();
        if (response.status === 'success') {
          setServices(response.data.education || []);
        }
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handlePurchase = () => {
    if (!selectedService) return;
    
    const amount = Number(selectedService.amount.replace(/[^0-9.]/g, ''));
    const totalPrice = amount * Number(quantity);

    if ((profile?.balance || 0) < totalPrice) {
      alert('Insufficient balance');
      return;
    }

    if (!profile?.isPinSet) {
      setShowSetupPinModal(true);
      return;
    }

    setShowPinModal(true);
  };

  const executePurchase = async () => {
    setShowProcessing(true);
    setProcessStatus('processing');
    setProcessMessage(`Generating your ${selectedService.type} PINs...`);

    try {
      const response = await vtuService.buyEducationPin({
        serviceID: selectedService.serviceID,
        quantity: Number(quantity)
      });

      if (response.status === 'success') {
        setProcessStatus('success');
        setProcessMessage(response.message || 'PINs generated successfully!');
        setPurchasedPins(response.data.pins || []);
      } else {
        setProcessStatus('error');
        setProcessMessage(response.message || 'Failed to complete purchase');
      }
    } catch (error: any) {
      setProcessStatus('error');
      setProcessMessage(error.response?.data?.message || 'An error occurred during purchase');
    }
  };

  const totalAmount = selectedService ? Number(selectedService.amount.replace(/[^0-9.]/g, '')) * Number(quantity) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Education PINs</h1>
          <p className="text-gray-500 font-medium">Instant result checker and exam tokens.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-blue-700" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</p>
            <p className="text-sm font-black text-gray-900">{services.length} Providers</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Provider Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Select Provider</h3>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-700 rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-400">Loading providers...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <button
                    key={`${service.serviceID}-${index}`}
                    onClick={() => setSelectedService(service)}
                    className={cn(
                      "relative p-6 rounded-3xl border-2 transition-all text-left group overflow-hidden",
                      selectedService?.serviceID === service.serviceID 
                        ? "border-blue-600 bg-blue-50/50" 
                        : "border-gray-50 bg-gray-50/30 hover:border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-blue-700 shadow-sm group-hover:scale-110 transition-transform">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900">{service.type}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          ₦{service.amount} / Unit
                        </p>
                      </div>
                    </div>
                    {selectedService?.serviceID === service.serviceID && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <AnimatePresence>
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Order Details</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Quantity</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 10].map(n => (
                        <option key={n} value={n}>{n} Unit{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                    <p className="text-xs font-bold text-amber-800 leading-relaxed">
                      Your PIN and Serial number will be generated instantly and saved to your transaction history. 
                      Please ensure you copy them correctly.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {purchasedPins.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Your PINs</h3>
              <div className="space-y-4">
                {purchasedPins.map((p, idx) => (
                  <div key={idx} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Receipt className="w-12 h-12" />
                    </div>
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PIN Number</p>
                        <p className="text-lg font-black text-gray-900 font-mono tracking-wider">{p.pin}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Serial Number</p>
                        <p className="text-lg font-black text-gray-900 font-mono tracking-wider">{p.serialNo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Summary</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Provider</span>
                <span className="text-sm font-black text-gray-900">{selectedService?.type || '---'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Unit Price</span>
                <span className="text-sm font-black text-gray-900">₦{selectedService?.amount || '0'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quantity</span>
                <span className="text-sm font-black text-gray-900">{quantity}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-blue-700">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={!selectedService}
              className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              <ShoppingCart className="w-5 h-5" />
              Purchase PIN
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Transaction
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PinModal 
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={executePurchase}
        correctPin={profile?.transactionPin}
        mode="verify"
        title="Verify Transaction"
        description={`Enter your 5-digit PIN to authorize purchase of ${quantity} ${selectedService?.type}`}
      />

      <PinModal 
        isOpen={showSetupPinModal}
        onClose={() => setShowSetupPinModal(false)}
        onSuccess={() => navigate('/profile')}
        mode="verify"
        title="PIN Required"
        description="You need to set a transaction PIN before you can make purchases. Would you like to set it now?"
      />

      <ProcessingModal 
        isOpen={showProcessing}
        onClose={() => setShowProcessing(false)}
        status={processStatus}
        message={processMessage}
      />
    </div>
  );
}
