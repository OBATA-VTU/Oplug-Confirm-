import React from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Apple, Play, Globe, Check, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppDownload() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Smartphone className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">Download App</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-xl font-black text-gray-900 mb-4">Experience Oplug on Mobile</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Get the best experience by downloading our mobile application. Enjoy faster transactions, real-time push notifications, and biometric security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Get it on</p>
                <p className="text-sm font-black">Google Play</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Apple className="w-6 h-6 fill-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Download on the</p>
                <p className="text-sm font-black">App Store</p>
              </div>
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-gray-600">Faster & Smoother Experience</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-gray-600">Instant Push Notifications</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-gray-600">Biometric Security (FaceID/Fingerprint)</p>
            </div>
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black mb-1">Web App (PWA)</h3>
            <p className="text-xs text-blue-100">Add Oplug to your home screen directly from your browser.</p>
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>
    </div>
  );
}
