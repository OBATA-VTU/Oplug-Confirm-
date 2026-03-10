import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Send, Terminal, ShieldCheck, AlertCircle } from 'lucide-react';
import CodeBlock from './CodeBlock';

export default function ApiSandbox() {
  const [endpoint, setEndpoint] = useState('/airtime/purchase');
  const [method, setMethod] = useState('POST');
  const [apiKey, setApiKey] = useState('OPLUG_SANDBOX_KEY_2026_TEST');
  const [payload, setPayload] = useState(`{
  "network": "MTN",
  "amount": 100,
  "phone": "08142452729",
  "request_id": "TEST_REF_001"
}`);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResponse({
        status: "success",
        message: "Sandbox request processed successfully",
        data: {
          transaction_id: "SANDBOX_TX_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
          environment: "sandbox",
          timestamp: new Date().toISOString()
        }
      });
      setLoading(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-gray-900">API Sandbox</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Test your API integration in a safe, isolated environment. No real funds will be deducted.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Request Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-700" />
              Request
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Method</label>
                  <select 
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option>GET</option>
                    <option>POST</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Endpoint</label>
                  <input 
                    type="text" 
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">API Key</label>
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Payload (JSON)</label>
                <textarea 
                  rows={6}
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono resize-none"
                />
              </div>

              <button 
                onClick={handleTest}
                disabled={loading}
                className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Request'}
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Response Panel */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl h-full flex flex-col">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Response
            </h3>

            {response ? (
              <div className="flex-1 overflow-auto">
                <pre className="text-sm font-mono text-blue-400">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Play className="w-12 h-12 text-white" />
                <p className="text-sm text-white font-bold">Send a request to see the response</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex gap-4">
        <AlertCircle className="w-6 h-6 text-blue-700 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          The sandbox environment simulates real API behavior but does not perform any actual transactions. Use it to verify your request format and handling.
        </p>
      </div>
    </motion.div>
  );
}
