import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApiDocsOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Introduction</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Welcome to the Oplug Developer API. Our API allows you to integrate our VTU services directly into your own applications, websites, or platforms.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
          <Zap className="w-6 h-6 text-blue-700" />
          <h3 className="font-bold">Fast & Reliable</h3>
          <p className="text-xs text-gray-500">Instant delivery for all services with 99.9% uptime.</p>
        </div>
        <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-3">
          <Shield className="w-6 h-6 text-emerald-700" />
          <h3 className="font-bold">Secure</h3>
          <p className="text-xs text-gray-500">Industry-standard encryption and security protocols.</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-3xl border border-purple-100 space-y-3">
          <Globe className="w-6 h-6 text-purple-700" />
          <h3 className="font-bold">Global Ready</h3>
          <p className="text-xs text-gray-500">Scale your business with our robust infrastructure.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Base URL</h2>
        <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl font-mono text-blue-700">
          https://oplug.vercel.app/api/v1
        </div>
        <p className="text-sm text-gray-500">
          All API requests must be made over HTTPS. Requests made over HTTP will fail.
        </p>
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <div />
        <Link to="/developer/docs/auth" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Authentication
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
