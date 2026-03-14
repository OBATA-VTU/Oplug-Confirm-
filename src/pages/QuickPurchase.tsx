import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Wifi, ArrowRight, CheckCircle2, 
  AlertCircle, Loader2, Zap, Tv, Lightbulb, 
  GraduationCap, Share2, ShieldCheck, CreditCard,
  ChevronRight, Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { vtuService, fundingService, smmService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function QuickPurchase() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'data' | 'airtime' | 'cable' | 'electricity' | 'education' | 'smm'>('data');
  const [network, setNetwork] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(profile?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<any>(null);
  const [smmServices, setSmmServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [vtuRes, smmRes] = await Promise.all([
          vtuService.getServices(),
          smmService.getServices()
        ]);
        
        if (vtuRes.status === 'success') {
          setServices(vtuRes.data);
        }
        if (Array.isArray(smmRes)) {
          setSmmServices(smmRes);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, []);

  const networks = [
    { id: 'mtn', name: 'MTN', color: 'bg-yellow-400' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-600' },
    { id: 'glo', name: 'Glo', color: 'bg-green-600' },
    { id: '9mobile', name: '9mobile', color: 'bg-emerald-800' },
  ];

  const getFilteredPlans = () => {
    if (!services) return [];
    
    switch (activeTab) {
      case 'data':
        return (services.dataPlans || []).filter((p: any) => p.network.toLowerCase().includes(network.toLowerCase()));
      case 'airtime':
        return (services.airtimePlans || []).filter((p: any) => p.network.toLowerCase().includes(network.toLowerCase()));
      case 'cable':
        return (services.cablePlans || []);
      case 'electricity':
        return (services.electricPlans || []);
      case 'education':
        return (services.educationPlans || []);
      case 'smm':
        return smmServices.filter(s => 
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          s.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      default:
        return [];
    }
  };

  const filteredPlans = getFilteredPlans();

  const handlePurchase = async () => {
    if (!email || !phone || !plan) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const amount = activeTab === 'smm' ? Number(plan.rate) : Number(plan.amount || plan.displayAmount);
      const fee = amount * 0.02;
      const totalAmount = amount + fee;

      const res = await fundingService.initializePaystack({
        email,
        amount: Math.ceil(totalAmount),
        reference: `QUICK_${Date.now()}`,
        metadata: {
          type: 'quick_purchase',
          serviceType: activeTab,
          network,
          phone,
          planId: plan.serviceID || plan.service,
          amount: amount
        }
      } as any);

      if (res.status) {
        window.location.href = res.data.authorization_url;
      } else {
        setError(res.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'data', name: 'Data', icon: Wifi, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'airtime', name: 'Airtime', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'cable', name: 'Cable TV', icon: Tv, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'electricity', name: 'Electricity', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'education', name: 'Education', icon: GraduationCap, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'smm', name: 'Social Media', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Zap className="w-4 h-4 fill-blue-700" />
            Fast & Secure
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">
            Quick <span className="text-blue-700">Purchase</span>
          </h1>
          <p className="text-gray-500 font-medium max-w-xl mx-auto">
            Buy any service instantly without logging in. Fast delivery, secure payments.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-blue-100 border border-gray-100">
          {/* Tabs */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-12">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPlan(null);
                  setNetwork('');
                }}
                className={cn(
                  "flex flex-col items-center gap-3 p-4 rounded-3xl transition-all group",
                  activeTab === tab.id 
                    ? "bg-blue-700 text-white shadow-xl shadow-blue-200 scale-105" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                )}
              >
                <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-white" : tab.color)} />
                <span className="text-[10px] font-black uppercase tracking-widest">{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              {/* Network Selection for Data/Airtime */}
              {(activeTab === 'data' || activeTab === 'airtime') && (
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Select Network</label>
                  <div className="grid grid-cols-4 gap-3">
                    {networks.map((net) => (
                      <button
                        key={net.id}
                        onClick={() => { setNetwork(net.name); setPlan(null); }}
                        className={cn(
                          "aspect-square rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group",
                          network === net.name ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-gray-50 hover:border-gray-200"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-full shadow-sm group-hover:scale-110 transition-transform", net.color)} />
                        <span className="text-[10px] font-black">{net.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SMM Search */}
              {activeTab === 'smm' && (
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Search Service</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text"
                      placeholder="Search for Instagram, TikTok, etc..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Plan Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Select Plan</label>
                <select 
                  value={plan?.serviceID || plan?.service || ''}
                  onChange={(e) => {
                    const selected = filteredPlans.find((p: any) => (p.serviceID || p.service).toString() === e.target.value);
                    setPlan(selected);
                  }}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                >
                  <option value="">Choose a plan...</option>
                  {filteredPlans.map((p: any, index: number) => (
                    <option key={`${p.serviceID || p.service}-${index}`} value={p.serviceID || p.service}>
                      {p.name || p.dataPlan || p.cablePlan || p.disco} - ₦{p.amount || p.displayAmount || p.rate}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number / Link</label>
                  <input 
                    type="text"
                    placeholder={activeTab === 'smm' ? "Enter profile or post link" : "08012345678"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                  <input 
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {/* Summary Card */}
              <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-6">
                <h3 className="text-lg font-black text-gray-900">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Service</span>
                    <span className="text-sm font-black text-gray-900 capitalize">{activeTab}</span>
                  </div>
                  {network && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-500">Network</span>
                      <span className="text-sm font-black text-gray-900">{network}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Price</span>
                    <span className="text-sm font-black text-gray-900">₦{plan?.amount || plan?.displayAmount || plan?.rate || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">Fee (2%)</span>
                    <span className="text-sm font-black text-gray-900">₦{((plan?.amount || plan?.displayAmount || plan?.rate || 0) * 0.02).toFixed(2)}</span>
                  </div>
                  
                  <div className="h-px bg-gray-200 my-4" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-black text-gray-900">Total</span>
                    <span className="text-2xl font-black text-blue-700">₦{((plan?.amount || plan?.displayAmount || plan?.rate || 0) * 1.02).toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <button 
                  onClick={handlePurchase}
                  disabled={loading || !plan}
                  className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      Pay Now
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Payment by Paystack</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-3xl border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Zap className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Instant Delivery</span>
                </div>
                <div className="p-4 bg-white rounded-3xl border border-gray-100 flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
