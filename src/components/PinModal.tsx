import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, ShieldCheck, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pin?: string) => void;
  title?: string;
  description?: string;
  correctPin?: string;
  mode: 'setup' | 'verify';
}

export default function PinModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title, 
  description, 
  correctPin,
  mode 
}: PinModalProps) {
  const [pin, setPin] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 4) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async () => {
    const pinString = pin.join('');
    if (pinString.length < 5) {
      setError('Please enter a 5-digit PIN');
      return;
    }

    setLoading(true);
    setError('');

    if (mode === 'verify') {
      if (pinString === correctPin) {
        onSuccess(pinString);
        onClose();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin(['', '', '', '', '']);
        document.getElementById('pin-0')?.focus();
      }
    } else {
      // Setup mode
      onSuccess(pinString);
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Lock className="w-8 h-8 text-blue-700" />
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {title || (mode === 'verify' ? 'Transaction PIN' : 'Set Transaction PIN')}
              </h2>
              <p className="text-gray-500 text-sm font-medium mb-8">
                {description || (mode === 'verify' ? 'Enter your 5-digit security PIN to authorize this transaction.' : 'Create a secure 5-digit PIN for your transactions.')}
              </p>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl mb-6 flex items-center gap-2 border border-red-100"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 mb-8">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-${idx}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className={cn(
                      "w-12 h-16 bg-gray-50 border-2 rounded-2xl text-center text-2xl font-black focus:outline-none transition-all",
                      digit ? "border-blue-700 bg-white shadow-lg shadow-blue-100" : "border-gray-100 focus:border-blue-700"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || pin.join('').length < 5}
                className="w-full bg-blue-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    {mode === 'verify' ? 'VERIFY & PROCEED' : 'SAVE PIN'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
