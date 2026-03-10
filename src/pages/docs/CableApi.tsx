import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Tv } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function CableApi() {
  const requestPayload = `{
  "service": "DSTV",
  "smartcard_number": "1234567890",
  "plan_id": "DSTV_COMPACT",
  "request_id": "CABLE_REF_123456"
}`;

  const responsePayload = `{
  "status": "success",
  "message": "Cable subscription successful",
  "data": {
    "transaction_id": "OPL_CABLE_987654321",
    "service": "DSTV",
    "plan": "Compact",
    "smartcard": "1234567890",
    "balance_before": 15000,
    "balance_after": 10500
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <Tv className="w-6 h-6 text-indigo-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Cable TV API</h1>
      </div>

      <p className="text-lg text-gray-500 leading-relaxed">
        Renew cable TV subscriptions for DSTV, GOTV, and Startimes.
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
            <code className="text-blue-700 font-mono">/cable/verify</code>
            <span className="text-xs text-gray-400 font-medium italic">- Verify Smartcard Number</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
            <code className="text-blue-700 font-mono">/cable/subscribe</code>
            <span className="text-xs text-gray-400 font-medium italic">- Process Subscription</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Verification Request</h2>
        <CodeBlock code={`{
  "service": "DSTV",
  "smartcard_number": "1234567890"
}`} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Verification Response</h2>
        <CodeBlock code={`{
  "status": "success",
  "data": {
    "customer_name": "JOHN DOE",
    "smartcard_number": "1234567890",
    "current_plan": "DSTV COMPACT",
    "status": "ACTIVE"
  }
}`} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Subscription Request</h2>
        <CodeBlock code={requestPayload} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sample Response</h2>
        <CodeBlock code={responsePayload} />
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs/data" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Data API
        </Link>
        <Link to="/developer/docs/electricity" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Electricity API
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
