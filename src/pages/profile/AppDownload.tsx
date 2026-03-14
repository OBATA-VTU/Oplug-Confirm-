import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Download, Apple, Play, Globe, Check, ShieldCheck, Zap, ArrowRight, AlertCircle, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AppDownload() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

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

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <Zap className="w-4 h-4 fill-blue-700" />
            Official Application
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-4">Experience Oplug on Mobile</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            Get the best experience by downloading our mobile application. Enjoy faster transactions, real-time push notifications, and biometric security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <button className="flex items-center gap-4 p-5 bg-gray-900 text-white rounded-[1.5rem] hover:bg-black transition-all group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 fill-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Get it on</p>
                <p className="text-base font-black">Google Play</p>
              </div>
            </button>

            <button className="flex items-center gap-4 p-5 bg-gray-900 text-white rounded-[1.5rem] hover:bg-black transition-all group">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Apple className="w-7 h-7 fill-white" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Download on the</p>
                <p className="text-base font-black">App Store</p>
              </div>
            </button>
          </div>

          <div className="space-y-4">
            {[
              'Faster & Smoother Experience',
              'Instant Push Notifications',
              'Biometric Security (FaceID/Fingerprint)',
              'Offline Access to Transaction History'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-gray-600">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Globe className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black mb-1">Web App (PWA)</h3>
              <p className="text-xs text-blue-100">Add Oplug to your home screen directly from your browser.</p>
            </div>
          </div>
          
          {isInstalled ? (
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Installed
            </div>
          ) : (
            <button 
              onClick={handleInstall}
              disabled={!deferredPrompt}
              className="w-full md:w-auto bg-white text-blue-700 px-10 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Install Now
            </button>
          )}
        </div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      </div>

      {!deferredPrompt && !isInstalled && (
        <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Installation Note</p>
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              If the install button is disabled, your browser might not support PWA installation or it's already installed. 
              On iOS, tap the <Share2 className="w-3 h-3 inline" /> icon and select "Add to Home Screen".
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
