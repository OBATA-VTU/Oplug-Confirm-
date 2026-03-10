import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Key, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function ApiDocsAuth() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Authentication</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          The Oplug API uses API Keys to authenticate requests. You can view and manage your API keys in the Developer Settings of your dashboard.
        </p>
      </div>

      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
        <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-900">Keep your API keys secret!</p>
          <p className="text-xs text-amber-700">Your API keys carry significant privileges. Do not share them in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Using your API Key</h2>
        <p className="text-gray-500">
          Authentication is performed by including your API key in the <code className="bg-gray-100 px-2 py-1 rounded text-blue-700">Authorization</code> header of your requests.
        </p>
        
        <CodeBlock 
          title="HTTP Header"
          language="http"
          code={`Authorization: Bearer YOUR_API_KEY`}
        />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sandbox Mode</h2>
        <p className="text-gray-500">
          For testing purposes, you can use our sandbox API key. Requests made with this key will not be processed by real providers and will not deduct from your balance.
        </p>
        <CodeBlock 
          title="Sandbox API Key"
          code={`OPLUG_SANDBOX_KEY_2026_TEST`}
        />
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Introduction
        </Link>
        <Link to="/developer/docs/airtime" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Airtime API
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
