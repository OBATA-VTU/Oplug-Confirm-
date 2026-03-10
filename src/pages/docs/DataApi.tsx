import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function DataApi() {
  const requestPayload = `{
  "network": "MTN",
  "plan_id": "1GB_SME",
  "phone": "08142452729",
  "request_id": "DATA_REF_123456"
}`;

  const responsePayload = `{
  "status": "success",
  "message": "Data purchase successful",
  "data": {
    "transaction_id": "OPL_DATA_987654321",
    "plan": "1GB SME",
    "phone": "08142452729",
    "network": "MTN",
    "balance_before": 5000,
    "balance_after": 4750
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
          <Wifi className="w-6 h-6 text-purple-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Data API</h1>
      </div>

      <p className="text-lg text-gray-500 leading-relaxed">
        Purchase data bundles for all major networks in Nigeria (MTN, Airtel, Glo, 9mobile).
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoint</h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
          <code className="text-blue-700 font-mono">/data/purchase</code>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Request Payload</h2>
        <CodeBlock code={requestPayload} />
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Parameter</th>
                <th className="py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Type</th>
                <th className="py-4 font-bold text-gray-400 uppercase tracking-widest text-[10px]">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-4 font-mono text-blue-700">network</td>
                <td className="py-4 text-gray-500 italic">string</td>
                <td className="py-4 text-gray-600">The network provider (MTN, AIRTEL, GLO, 9MOBILE)</td>
              </tr>
              <tr>
                <td className="py-4 font-mono text-blue-700">plan_id</td>
                <td className="py-4 text-gray-500 italic">string</td>
                <td className="py-4 text-gray-600">The unique ID of the data plan (e.g., 1GB_SME)</td>
              </tr>
              <tr>
                <td className="py-4 font-mono text-blue-700">phone</td>
                <td className="py-4 text-gray-500 italic">string</td>
                <td className="py-4 text-gray-600">The recipient's phone number</td>
              </tr>
              <tr>
                <td className="py-4 font-mono text-blue-700">request_id</td>
                <td className="py-4 text-gray-500 italic">string</td>
                <td className="py-4 text-gray-600">A unique reference for the transaction</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sample Response</h2>
        <CodeBlock code={responsePayload} />
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs/airtime" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Airtime API
        </Link>
        <Link to="/developer/docs/cable" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Cable TV API
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
