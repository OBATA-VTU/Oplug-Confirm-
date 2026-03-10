import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Landmark, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CryptoApi() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
          <Landmark className="w-6 h-6 text-orange-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Crypto API</h1>
      </div>

      <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-blue-900 mb-2">Coming Soon</h3>
          <p className="text-blue-700 leading-relaxed">
            We are currently finalizing our Crypto Buy/Sell API. This will allow you to programmatically trade Bitcoin, Ethereum, USDT, and other popular cryptocurrencies at competitive rates.
          </p>
        </div>
      </div>

      <div className="space-y-8 opacity-50 pointer-events-none">
        <h2 className="text-2xl font-bold">Planned Features</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-3">
            <h4 className="font-bold">Real-time Rates</h4>
            <p className="text-sm text-gray-500">Fetch live market rates for all supported pairs.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-3">
            <h4 className="font-bold">Instant Swap</h4>
            <p className="text-sm text-gray-500">Convert between different crypto assets instantly.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-3">
            <h4 className="font-bold">Wallet Management</h4>
            <p className="text-sm text-gray-500">Generate and manage crypto wallets for your users.</p>
          </div>
          <div className="p-6 bg-white rounded-3xl border border-gray-100 space-y-3">
            <h4 className="font-bold">Webhook Notifications</h4>
            <p className="text-sm text-gray-500">Receive instant alerts for incoming crypto payments.</p>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs/smm" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: SMM API
        </Link>
        <Link to="/developer/docs/sandbox" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: API Sandbox
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
