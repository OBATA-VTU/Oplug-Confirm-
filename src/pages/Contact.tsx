import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, MessageSquare, Ticket, Send } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Contact() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'pages', 'contact'));
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching contact page content:', err);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-20 pb-32">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-black mb-8">{content?.title || 'Get in Touch'}</h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              {content?.subtitle || 'Have a question or need assistance? Our team is here to help you 24/7.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="relative">
                <img 
                  src={content?.heroImage || "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&q=80&w=1000"} 
                  alt="Contact Us" 
                  className="w-full max-w-md mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-700" />
                  </div>
                  <h3 className="font-bold">Email Us</h3>
                  <p className="text-sm text-gray-500">{content?.email || 'support@oplug.com'}</p>
                </div>
                <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-emerald-700" />
                  </div>
                  <h3 className="font-bold">WhatsApp</h3>
                  <p className="text-sm text-gray-500">{content?.whatsapp || '+234 814 245 2729'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 lg:p-16 border border-gray-100 shadow-xl shadow-gray-100/50">
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" placeholder="Your Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                    <input type="email" placeholder="Your Email" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                  <input type="text" placeholder="How can we help?" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Message</label>
                  <textarea placeholder="Your Message" rows={5} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                </div>
                <button className="w-full bg-blue-700 text-white font-bold py-5 rounded-2xl hover:bg-blue-800 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                  Send Message
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
