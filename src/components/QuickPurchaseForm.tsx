import React, { useState, useEffect } from 'react';
import { Smartphone, Wifi, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { vtuService, fundingService } from '../services/apiService';
import { motion, AnimatePresence } from 'motion/react';

export default function QuickPurchaseForm() {
  const [type, setType] = useState<'airtime' | 'data'>('data');
  const [network, setNetwork] = useState('');
  const [dataType, setDataType] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [services, setServices] = useState<any>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await vtuService.getServices();
        if (res.status === 'success') {
          setServices(res.data);
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

  const dataTypes = services && network ? Array.from(new Set(
    (services.dataPlans || [])
      .filter((p: any) => p.network.toLowerCase().includes(network.toLowerCase()))
      .map((p: any) => p.dataType)
  )) : [];

  const filteredPlans = services ? (
    type === 'data' 
      ? (services.dataPlans || []).filter((p: any) => 
          p.network.toLowerCase().includes(network.toLowerCase()) && 
          (!dataType || p.dataType === dataType)
        )
      : (services.airtimePlans || []).filter((p: any) => p.network.toLowerCase().includes(network.toLowerCase()))
  ) : [];

  const handlePurchase = async () => {
    if (!network || !plan || !phone || !email) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Calculate total with 2% fee
      const baseAmount = type === 'data' ? Number(plan.amount) : Number(plan.amount); // For airtime, plan.amount is the value
      const totalAmount = baseAmount * 1.02;

      // Initialize Paystack
      const res = await fundingService.initializePaystack({
        email,
        amount: Math.ceil(totalAmount),
        reference: `QUICK_${Date.now()}`,
        metadata: {
          type: 'quick_purchase',
          vtuType: type,
          network,
          phone,
          planId: plan.serviceID,
          amount: plan.amount
        }
      } as any);

      if (res.status) {
        // Redirect to Paystack
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

  return (
    <div className="space-y-8">
      {/* Type Selection */}
      <div className="flex p-1 bg-gray-100 rounded-2xl">
        <button 
          onClick={() => { setType('data'); setPlan(null); }}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
            type === 'data' ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Wifi className="w-4 h-4" />
          Data
        </button>
        <button 
          onClick={() => { setType('airtime'); setPlan(null); }}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2",
            type === 'airtime' ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Smartphone className="w-4 h-4" />
          Airtime
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Network Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Select Network</label>
          <div className="grid grid-cols-4 gap-3">
            {networks.map((net) => (
              <button
                key={net.id}
                onClick={() => { 
                  setNetwork(net.name); 
                  setDataType('');
                  setPlan(null); 
                }}
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

        {/* Data Type Selection */}
        {type === 'data' && network && (
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Data Type</label>
            <div className="flex flex-wrap gap-2">
              {dataTypes.map((t: any) => (
                <button
                  key={t}
                  onClick={() => { setDataType(t); setPlan(null); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    dataType === t ? "bg-blue-700 text-white" : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Plan Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Select Plan</label>
          <select 
            value={plan?.serviceID || ''}
            onChange={(e) => {
              const selected = filteredPlans.find((p: any) => p.serviceID.toString() === e.target.value);
              setPlan(selected);
            }}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
          >
            <option value="">Choose a plan...</option>
            {filteredPlans.map((p: any, index: number) => (
              <option key={`${p.serviceID}-${index}`} value={p.serviceID}>
                {p.name || p.dataPlan} - ₦{p.amount || p.displayAmount} {p.validity ? `(${p.validity})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
            <input 
              type="tel"
              placeholder="08012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
            <input 
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Summary */}
        {plan && (
          <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-2">
            <div className="flex justify-between text-xs font-bold text-blue-900">
              <span>Price</span>
              <span>₦{plan.amount}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-blue-900">
              <span>Processing Fee (2%)</span>
              <span>₦{(Number(plan.amount) * 0.02).toFixed(2)}</span>
            </div>
            <div className="h-px bg-blue-200 my-2" />
            <div className="flex justify-between text-sm font-black text-blue-900">
              <span>Total to Pay</span>
              <span>₦{(Number(plan.amount) * 1.02).toFixed(2)}</span>
            </div>
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
              Buy Now
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-[10px] text-center text-gray-400 font-bold">
          Secure payment powered by Paystack.
        </p>
      </div>
    </div>
  );
}
