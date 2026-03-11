import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProcessingModalProps {
  isOpen: boolean;
  status: 'processing' | 'success' | 'error';
  message?: string;
  onClose?: () => void;
}

export default function ProcessingModal({ isOpen, status, message, onClose }: ProcessingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-sm bg-white rounded-[2.5rem] p-10 shadow-2xl text-center"
          >
            <div className="flex flex-col items-center">
              {status === 'processing' && (
                <>
                  <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-blue-50 rounded-full" />
                    <motion.div 
                      className="absolute inset-0 border-4 border-blue-700 rounded-full border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <Shield className="absolute inset-0 m-auto w-10 h-10 text-blue-700 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Processing Transaction</h3>
                  <p className="text-gray-500 text-sm font-medium">Please wait while we verify and process your request. Do not refresh this page.</p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Transaction Successful</h3>
                  <p className="text-gray-500 text-sm font-medium mb-8">{message || 'Your transaction has been completed successfully.'}</p>
                  <button 
                    onClick={onClose}
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 hover:scale-[1.02] transition-transform"
                  >
                    CONTINUE
                  </button>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
                    <AlertCircle className="w-12 h-12 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">Transaction Failed</h3>
                  <p className="text-gray-500 text-sm font-medium mb-8">{message || 'An error occurred while processing your transaction.'}</p>
                  <button 
                    onClick={onClose}
                    className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-red-100 hover:scale-[1.02] transition-transform"
                  >
                    TRY AGAIN
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
