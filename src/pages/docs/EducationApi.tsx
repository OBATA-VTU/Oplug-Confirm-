import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function EducationApi() {
  const requestPayload = `{
  "exam": "WAEC",
  "quantity": 1,
  "request_id": "EDU_REF_123456"
}`;

  const responsePayload = `{
  "status": "success",
  "message": "Education PIN purchase successful",
  "data": {
    "transaction_id": "OPL_EDU_987654321",
    "exam": "WAEC",
    "pins": ["123456789012"],
    "serials": ["SER123456789"],
    "balance_before": 5000,
    "balance_after": 1500
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
          <GraduationCap className="w-6 h-6 text-emerald-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Education API</h1>
      </div>

      <p className="text-lg text-gray-500 leading-relaxed">
        Purchase examination PINs for WAEC, NECO, and NABTEB.
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoint</h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
          <code className="text-blue-700 font-mono">/education/purchase</code>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Request Payload</h2>
        <CodeBlock code={requestPayload} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sample Response</h2>
        <CodeBlock code={responsePayload} />
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs/electricity" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Electricity API
        </Link>
        <Link to="/developer/docs/sandbox" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Sandbox / Testing
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
