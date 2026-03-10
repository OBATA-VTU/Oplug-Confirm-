import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import CodeBlock from './CodeBlock';

export default function ElectricityApi() {
  const requestPayload = `{
  "disco": "IKEDC",
  "meter_number": "45012345678",
  "meter_type": "PREPAID",
  "amount": 2000,
  "request_id": "ELEC_REF_123456"
}`;

  const responsePayload = `{
  "status": "success",
  "message": "Electricity payment successful",
  "data": {
    "transaction_id": "OPL_ELEC_987654321",
    "token": "1234-5678-9012-3456-7890",
    "amount": 2000,
    "meter": "45012345678",
    "balance_before": 10000,
    "balance_after": 8000
  }
}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-yellow-700" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-gray-900">Electricity API</h1>
      </div>

      <p className="text-lg text-gray-500 leading-relaxed">
        Pay electricity bills for all major distribution companies (IKEDC, EKEDC, AEDC, etc.).
      </p>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Endpoints</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
            <code className="text-blue-700 font-mono">/electricity/verify</code>
            <span className="text-xs text-gray-400 font-medium italic">- Verify Meter Number</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold uppercase">POST</span>
            <code className="text-blue-700 font-mono">/electricity/pay</code>
            <span className="text-xs text-gray-400 font-medium italic">- Process Payment</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Verification Request</h2>
        <CodeBlock code={`{
  "disco": "IKEDC",
  "meter_number": "45012345678",
  "meter_type": "PREPAID"
}`} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Verification Response</h2>
        <CodeBlock code={`{
  "status": "success",
  "data": {
    "customer_name": "JANE SMITH",
    "meter_number": "45012345678",
    "address": "123 VTU STREET, LAGOS",
    "disco": "IKEDC"
  }
}`} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Payment Request</h2>
        <CodeBlock code={requestPayload} />
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Sample Response</h2>
        <CodeBlock code={responsePayload} />
      </div>

      <div className="pt-8 border-t border-gray-100 flex justify-between items-center">
        <Link to="/developer/docs/cable" className="flex items-center gap-2 text-gray-400 font-bold hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Previous: Cable TV API
        </Link>
        <Link to="/developer/docs/education" className="flex items-center gap-2 text-blue-700 font-bold hover:underline">
          Next: Education API
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
