import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function SmmApi() {
  const requestPayload = `{
  "service_id": 123,
  "link": "https://instagram.com/p/abc123",
  "quantity": 1000,
  "request_id": "SMM_REF_123456"
}`;

  const responsePayload = `{
  "status": "success",
  "message": "SMM order placed successfully",
  "data": {
    "order_id": "OPL_SMM_987654321",
    "service": "Instagram Likes",
    "quantity": 1000,
    "charge": 500,
    "balance_before": 5000,
    "balance_after": 4500
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
          <ShoppingCart className="w-6 h-6 text-emerald-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">SMM Booster API</h1>
      </div>

      <p className="text-lg text-gray-500 leading-relaxed">
        Automate social media marketing services including likes, followers, views, and more.
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">GET</span>
            <code className="text-blue-700 font-mono">/smm/services</code>
            <span className="text-xs text-gray-400 font-medium italic">- List Available Services</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
            <code className="text-blue-700 font-mono">/smm/order</code>
            <span className="text-xs text-gray-400 font-medium italic">- Place New Order</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">GET</span>
            <code className="text-blue-700 font-mono">/smm/status/:order_id</code>
            <span className="text-xs text-gray-400 font-medium italic">- Check Order Status</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Order Request</h2>
        <CodeBlock code={requestPayload} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sample Response</h2>
        <CodeBlock code={responsePayload} />
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs/education" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Education API
        </Link>
        <Link to="/developer/docs/crypto" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Crypto API
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
