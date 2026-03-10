import React from 'react';
import { motion } from 'motion/react';
import { Gavel, AlertTriangle, CheckCircle2, Info, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import Logo from '../components/Logo';

export default function Terms() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className={cn("min-h-screen pb-32", isDashboard ? "bg-transparent" : "bg-gray-50")}>
      {/* Public Header - Only show if not in dashboard */}
      {!isDashboard && (
        <nav className="h-20 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <Link to="/">
              <Logo className="scale-90" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </nav>
      )}

      <div className={cn("container mx-auto px-6 max-w-4xl", isDashboard ? "mt-0" : "mt-16")}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "space-y-12",
            !isDashboard && "bg-white rounded-[3rem] p-8 md:p-16 shadow-xl shadow-blue-100/50 border border-gray-100"
          )}
        >
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-gray-900">Terms of Service</h1>
            <p className="text-gray-500 max-w-md mx-auto">Please read these terms carefully before using Oplug services.</p>
          </div>

          <div className="prose prose-blue max-w-none space-y-8 text-gray-600 leading-relaxed">
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Gavel className="w-6 h-6 text-blue-700" />
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Oplug, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-700" />
                2. User Account
              </h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-blue-700" />
                3. Prohibited Activities
              </h2>
              <p>
                You may not use Oplug for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction (including but not limited to copyright laws).
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-700" />
                4. Modifications to Service
              </h2>
              <p>
                Oplug reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
