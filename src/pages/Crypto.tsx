import React from 'react';
import { Landmark, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Crypto() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <h2 className="text-2xl font-bold">Crypto Buy & Sell</h2>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-12 shadow-sm border border-gray-100 text-center space-y-8"
      >
        <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center mx-auto">
          <Landmark className="w-12 h-12 text-orange-600" />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-3xl font-black text-gray-900">Coming Soon!</h3>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
            We are working hard to bring you the best crypto trading experience. Soon you'll be able to buy and sell Bitcoin, Ethereum, and USDT directly from your Oplug wallet.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm inline-flex mx-auto">
          <AlertCircle className="w-4 h-4" />
          Stay tuned for updates
        </div>

        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-50">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto">
              <span className="font-bold text-gray-400">BTC</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Bitcoin</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto">
              <span className="font-bold text-gray-400">ETH</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Ethereum</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto">
              <span className="font-bold text-gray-400">USDT</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Tether</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
