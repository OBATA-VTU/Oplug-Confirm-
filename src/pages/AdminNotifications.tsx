import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Bell, Send, Users, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AdminNotifications() {
  const [target, setTarget] = useState('all');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSend = async () => {
    if (!title || !message) {
      setStatus({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const notification = {
        title,
        message,
        type,
        target,
        userId: target === 'single' ? userId : null,
        createdAt: serverTimestamp(),
        read: false
      };

      await addDoc(collection(db, 'notifications'), notification);
      
      setStatus({ type: 'success', text: 'Notification sent successfully!' });
      setTitle('');
      setMessage('');
      setUserId('');
    } catch (err) {
      console.error('Error sending notification:', err);
      setStatus({ type: 'error', text: 'Failed to send notification.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Push Notifications</h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">
          <Bell className="w-4 h-4" />
          Broadcast System
        </div>
      </div>

      {status.text && (
        <div className={cn(
          "p-4 rounded-2xl text-sm font-bold border flex items-center gap-3",
          status.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {status.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Target Selection */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Target Audience</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTarget('all')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all text-center space-y-2",
                  target === 'all' ? "border-blue-700 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-400"
                )}
              >
                <Users className="w-8 h-8 mx-auto" />
                <p className="font-bold text-sm">All Users</p>
              </button>
              <button 
                onClick={() => setTarget('single')}
                className={cn(
                  "p-6 rounded-3xl border-2 transition-all text-center space-y-2",
                  target === 'single' ? "border-blue-700 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-400"
                )}
              >
                <User className="w-8 h-8 mx-auto" />
                <p className="font-bold text-sm">Single User</p>
              </button>
            </div>
          </div>

          {/* Type Selection */}
          <div className="space-y-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Notification Type</label>
            <div className="grid grid-cols-3 gap-3">
              {['info', 'warning', 'success'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "px-4 py-3 rounded-2xl border-2 transition-all text-xs font-bold uppercase tracking-widest",
                    type === t 
                      ? "border-blue-700 bg-blue-50 text-blue-700" 
                      : "border-gray-100 bg-white text-gray-400"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {target === 'single' && (
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">User ID</label>
              <input 
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter User UID"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification Title"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Message</label>
            <textarea 
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-blue-700 text-white py-5 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-2xl shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Notification'}
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
