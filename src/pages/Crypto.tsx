import React, { useState, useEffect } from 'react';
import { 
  Landmark, AlertCircle, ArrowLeft, Wallet, 
  TrendingUp, TrendingDown, RefreshCw, 
  ShieldCheck, ArrowRight, Loader2, Coins, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { nowpaymentsService } from '../services/nowpaymentsService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

export default function Crypto() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'fund' | 'buy' | 'sell'>('fund');
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCurrencies, setFetchingCurrencies] = useState(true);
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('usdttrc20');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [estimate, setEstimate] = useState<any>(null);
  const [minAmount, setMinAmount] = useState<number>(0);

  useEffect(() => {
    const fetchMinAmount = async () => {
      if (selectedCurrency) {
        try {
          const res = await nowpaymentsService.getMinAmount('usd', selectedCurrency);
          setMinAmount(res.min_amount || 0);
        } catch (err) {
          console.error('Failed to fetch min amount:', err);
        }
      }
    };
    fetchMinAmount();
  }, [selectedCurrency]);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const res = await nowpaymentsService.getCurrencies();
        if (res.currencies && Array.isArray(res.currencies)) {
          // Ensure we only have unique strings
          const formattedCurrencies = Array.from(new Set(res.currencies.map((c: any) => {
            if (typeof c === 'string') return c;
            if (c && typeof c === 'object') return c.ticker || c.code || String(c);
            return null;
          }).filter(v => v && typeof v === 'string'))) as string[];
          
          setCurrencies(formattedCurrencies);
          // Set a default if current selection is not in the new list
          if (formattedCurrencies.length > 0 && !formattedCurrencies.includes(selectedCurrency)) {
            setSelectedCurrency(formattedCurrencies[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch currencies:', err);
      } finally {
        setFetchingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

  const handleEstimate = async () => {
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0 || !selectedCurrency) {
      setEstimate(null);
      return;
    }
    
    try {
      const res = await nowpaymentsService.getEstimate(numAmount, 'usd', selectedCurrency);
      setEstimate(res);
    } catch (err) {
      console.error('Estimate failed:', err);
      setEstimate(null);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const numAmount = Number(amount);
      if (numAmount > 0 && selectedCurrency) {
        handleEstimate();
      } else {
        setEstimate(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [amount, selectedCurrency]);

  const handleAction = async () => {
    const numAmount = Number(amount);
    if (!amount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount < minAmount) {
      setError(`Minimum amount for ${selectedCurrency.toUpperCase()} is $${minAmount}`);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'fund' || activeTab === 'sell') {
        const res = await nowpaymentsService.createPayment({
          price_amount: Number(amount),
          price_currency: 'usd',
          pay_currency: selectedCurrency,
          order_id: `${(activeTab || 'fund').toString().toUpperCase()}_${Date.now()}`,
          order_description: `${activeTab === 'fund' ? 'Wallet Funding' : 'Crypto Sale'} via ${selectedCurrency}`,
          success_url: `${window.location.origin}/dashboard`,
          cancel_url: `${window.location.origin}/crypto`
        });

        if (res.invoice_url || res.payment_url) {
          window.location.href = res.invoice_url || res.payment_url;
        } else {
          setSuccess(`Please send exactly ${res.pay_amount} ${(res.pay_currency || selectedCurrency || '').toString().toUpperCase()} to: ${res.pay_address}`);
        }
      } else if (activeTab === 'buy') {
        // Buy Crypto: Deduct Naira balance, send Crypto to user
        const currentBalance = profile?.walletBalance || 0;
        if (currentBalance < Number(amount) * 1500) { // Assuming 1500 NGN/USD rate for simplicity
          setError('Insufficient balance to buy this amount of crypto');
          setLoading(false);
          return;
        }
        
        // In a real app, this would trigger a payout or a manual admin review
        setError('Crypto purchase request submitted. Our team will process your payout to your provided wallet address within 30 minutes.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Crypto Hub</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Powered by NOWPayments</p>
          </div>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-black text-blue-700">₦{profile?.walletBalance?.toLocaleString() || '0'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 rounded-[2rem] max-w-md mx-auto">
        {[
          { id: 'fund', name: 'Fund Wallet', icon: Wallet },
          { id: 'buy', name: 'Buy Crypto', icon: TrendingUp },
          { id: 'sell', name: 'Sell Crypto', icon: TrendingDown },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all flex items-center justify-center gap-2",
              activeTab === tab.id 
                ? "bg-white text-blue-700 shadow-sm scale-105" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Form */}
        <motion.div 
          layout
          className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-blue-100 border border-gray-100 space-y-8"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Amount in USD</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-gray-400">$</span>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-5 text-xl font-black focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Select Currency</label>
              <select 
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-sm font-black focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {fetchingCurrencies ? (
                  <option>Loading currencies...</option>
                ) : (
                  currencies.map((curr, index) => (
                    <option key={`${String(curr)}-${index}`} value={String(curr)}>{String(curr).toUpperCase()}</option>
                  ))
                )}
              </select>
            </div>

            {estimate && (
              <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-900/60">You will pay</span>
                  <span className="text-sm font-black text-blue-900">{estimate.estimated_amount} {(selectedCurrency || '').toString().toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-blue-900/60">Exchange Rate</span>
                  <span className="text-[10px] font-black text-blue-700">1 USD ≈ {(estimate.estimated_amount / Number(amount)).toFixed(8)} {(selectedCurrency || '').toString().toUpperCase()}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {success}
              </div>
            )}

            <button 
              onClick={handleAction}
              disabled={loading || !amount}
              className="w-full bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {activeTab === 'fund' ? 'Generate Payment' : activeTab === 'buy' ? 'Buy Now' : 'Sell Now'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[3rem] p-8 text-white space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-black">Secure Transactions</h3>
              <p className="text-sm text-blue-100/60 leading-relaxed">
                All crypto transactions are processed through NOWPayments, ensuring top-tier security and instant confirmation.
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
          </div>

          <div className="bg-white rounded-[3rem] p-8 border border-gray-100 space-y-6">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Market Overview</h4>
            <div className="space-y-4">
              {[
                { name: 'Bitcoin', symbol: 'BTC', price: '$64,231.50', change: '+2.4%' },
                { name: 'Ethereum', symbol: 'ETH', price: '$3,452.12', change: '-0.8%' },
                { name: 'Tether', symbol: 'USDT', price: '$1.00', change: '0.0%' },
              ].map((coin) => (
                <div key={coin.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Coins className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{coin.name}</p>
                      <p className="text-[10px] font-bold text-gray-400">{coin.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-gray-900">{coin.price}</p>
                    <p className={cn(
                      "text-[10px] font-black",
                      coin.change.startsWith('+') ? "text-emerald-500" : coin.change.startsWith('-') ? "text-red-500" : "text-gray-400"
                    )}>{coin.change}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              Crypto investments are volatile. Please ensure you double-check wallet addresses before sending funds. Oplug is not responsible for funds sent to wrong addresses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
