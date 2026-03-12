import React from 'react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      {/* Left Side - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full -mr-48 -mt-48 opacity-50 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-800 rounded-full -ml-48 -mb-48 opacity-50 blur-3xl" />
        
        <div className="relative z-10">
          <Logo className="scale-150 origin-left brightness-0 invert" />
        </div>

        <div className="relative z-10">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black text-white leading-tight mb-6"
          >
            Empowering Your <br />
            <span className="text-blue-200 text-6xl">Digital Lifestyle.</span>
          </motion.h2>
          <p className="text-blue-100 text-xl max-w-md font-medium">
            Join thousands of users who trust Oplug for their daily VTU, SMM, and digital payment needs.
          </p>
        </div>

        <div className="relative z-10 flex gap-8 text-blue-200 text-sm font-bold uppercase tracking-widest">
          <span>Reliable</span>
          <span>Secure</span>
          <span>Fast</span>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-12">
            <Logo className="scale-125" />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-blue-900/5 border border-gray-100"
          >
            <div className="mb-10">
              <h1 className="text-3xl font-black text-gray-900 mb-2">{title}</h1>
              {subtitle && <p className="text-gray-500 font-medium">{subtitle}</p>}
            </div>

            {children}
          </motion.div>

          <p className="mt-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
            © 2026 Oplug Digital Services. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
