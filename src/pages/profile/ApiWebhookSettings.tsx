import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Code, Copy, Check, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export default function ApiWebhookSettings() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [webhookUrl, setWebhookUrl] = useState(profile?.webhookUrl || '');

  const generateApiKey = async () => {
    if (!user) return;
    setLoading(true);
    const newKey = 'OPLUG_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { apiKey: newKey });
      setMessage({ type: 'success', text: 'New API Key generated successfully!' });
    } catch (err) {
      console.error('Error generating API key:', err);
      setMessage({ type: 'error', text: 'Failed to generate API key.' });
    } finally {
      setLoading(false);
    }
  };

  const updateWebhook = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { webhookUrl });
      setMessage({ type: 'success', text: 'Webhook URL updated successfully!' });
    } catch (err) {
      console.error('Error updating webhook:', err);
      setMessage({ type: 'error', text: 'Failed to update webhook URL.' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/profile')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Code className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-black tracking-tight text-gray-900">API & Webhooks</h1>
      </div>

      <div className="space-y-6">
        {/* API Key Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-gray-900">API Key</h3>
            <button 
              onClick={generateApiKey}
              disabled={loading}
              className="p-2 text-blue-700 hover:bg-blue-50 rounded-xl transition-colors disabled:opacity-50"
              title="Generate New Key"
            >
              <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
            </button>
          </div>

          <div className="relative group">
            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 pr-12 text-sm font-mono font-bold break-all">
              {profile?.apiKey || 'No API Key generated yet'}
            </div>
            {profile?.apiKey && (
              <button 
                onClick={() => copyToClipboard(profile.apiKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-700 transition-colors"
              >
                {copying ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
              </button>
            )}
          </div>
          <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            Keep your API key secret. Do not share it with anyone. Generating a new key will invalidate the old one.
          </p>
        </div>

        {/* Webhook Section */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-black text-gray-900 mb-6">Webhook Configuration</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Webhook URL</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="https://your-domain.com/webhook"
                />
              </div>
            </div>
            <button 
              onClick={updateWebhook}
              disabled={loading}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Webhook URL'}
            </button>
          </div>
          <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
            We will send POST requests to this URL for transaction status updates.
          </p>
        </div>
      </div>
    </div>
  );
}
