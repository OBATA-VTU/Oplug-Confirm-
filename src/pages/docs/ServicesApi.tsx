import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function ServicesApi() {
  const responsePayload = `{
  "status": "success",
  "data": [
    {
      "id": "MTN_1GB",
      "name": "MTN 1GB (SME)",
      "category": "data",
      "price": 250,
      "validity": "30 Days",
      "status": "active"
    },
    {
      "id": "DSTV_COMPACT",
      "name": "DSTV Compact",
      "category": "cable",
      "price": 10500,
      "validity": "Monthly",
      "status": "active"
    }
  ]
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
          <List className="w-6 h-6 text-blue-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Services API</h1>
      </div>

      <p className="text-lg text-gray-500 leading-relaxed">
        Fetch all available services, their IDs, and current prices programmatically. This ensures your application always has the latest pricing information.
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoint</h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold uppercase">GET</span>
          <code className="text-blue-700 font-mono">/services/list</code>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Query Parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Parameter</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Required</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="px-6 py-4 font-mono text-blue-700">category</td>
                <td className="px-6 py-4">string</td>
                <td className="px-6 py-4 text-gray-400">No</td>
                <td className="px-6 py-4">Filter by category (e.g., data, airtime, cable)</td>
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
        <Link to="/developer/docs/auth" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Authentication
        </Link>
        <Link to="/developer/docs/airtime" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Airtime API
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
