import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code, Key, Globe, Copy, CheckCircle2, RefreshCw, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function DeveloperAPI() {
  const { profile, user } = useAuth();
  const [apiKey, setApiKey] = useState(profile?.apiKey || '');
  const [webhook, setWebhook] = useState(profile?.webhookUrl || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'op_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerateKey = async () => {
    setLoading(true);
    const newKey = generateKey();
    try {
      await updateDoc(doc(db, 'users', user?.uid || ''), {
        apiKey: newKey
      });
      setApiKey(newKey);
      setMessage({ type: 'success', text: 'API Key generated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate API key.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWebhook = async () => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user?.uid || ''), {
        webhookUrl: webhook
      });
      setMessage({ type: 'success', text: 'Webhook URL updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update webhook URL.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer's API</h1>
          <p className="text-gray-500 mt-1">Integrate Oplug services into your own applications.</p>
        </div>
      </div>

      {message.text && (
        <div className={cn(
          "p-4 rounded-2xl text-sm font-bold border",
          message.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 space-y-8">
        {!apiKey ? (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
              <Key className="w-10 h-10 text-blue-700" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-2">Generate Your API Key</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                To start using our developer tools, you need to generate a unique API key. This key will be used to authenticate your requests.
              </p>
            </div>
            <button 
              onClick={handleGenerateKey}
              disabled={loading}
              className="bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate API Key'}
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Your API Key</label>
                <div className="relative group">
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-mono text-gray-600 break-all pr-12">
                    {apiKey}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(apiKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <button 
                  onClick={handleGenerateKey}
                  disabled={loading}
                  className="text-xs font-bold text-blue-700 flex items-center gap-1 hover:underline"
                >
                  <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
                  Reset API Key
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Webhook URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={webhook}
                    onChange={(e) => setWebhook(e.target.value)}
                    placeholder="https://your-site.com/webhook"
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleUpdateWebhook}
                    disabled={loading}
                    className="bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    Update
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 ml-1">Receive real-time notifications for transaction status updates.</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-700 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-blue-900 mb-1">API Documentation</h4>
                <p className="text-sm text-blue-700 leading-relaxed mb-4">
                  Our API is designed to be simple and easy to integrate. View our full documentation for guides and code samples.
                </p>
                <Link to="/developer/docs" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:underline">
                  View Documentation
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold">API Pricing</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Transactions made via the API are charged at wholesale rates. You can view all service IDs and their corresponding prices in the pricing table.
          </p>
          <button className="text-sm font-bold text-blue-700 hover:underline">View Service IDs & Pricing</button>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-lg font-bold">Need Help?</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            If you encounter any issues with integration, our developer support team is available to assist you.
          </p>
          <div className="flex gap-4">
            <a href="https://wa.me/2348142452729" className="text-sm font-bold text-emerald-600 hover:underline">WhatsApp Support</a>
            <a href="mailto:dev@oplug.com" className="text-sm font-bold text-blue-700 hover:underline">Email Support</a>
          </div>
        </div>
      </div>
    </div>
  );
}
