import { Facebook, Twitter, Instagram, Mail, MessageCircle, Phone, Globe, ExternalLink, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Support() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'pages', 'support'));
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching support page content:', err);
      }
    };
    fetchContent();
  }, []);

  const socialLinks = content?.socialLinks || [
    { 
      name: 'WhatsApp Support', 
      desc: 'Chat with our support team instantly', 
      icon: MessageCircle, 
      color: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-500',
      link: 'https://wa.me/2348123456789'
    },
    { 
      name: 'Telegram Channel', 
      desc: 'Join for latest updates and news', 
      icon: MessageCircle, 
      color: 'bg-blue-50 text-blue-700',
      iconBg: 'bg-blue-500',
      link: 'https://t.me/oplug_updates'
    },
    { 
      name: 'Email Support', 
      desc: 'Send us a detailed inquiry', 
      icon: Mail, 
      color: 'bg-indigo-50 text-indigo-700',
      iconBg: 'bg-indigo-600',
      link: 'mailto:support@oplug.com'
    },
    { 
      name: 'Instagram', 
      desc: 'Follow us for tips and promos', 
      icon: Instagram, 
      color: 'bg-rose-50 text-rose-700',
      iconBg: 'bg-rose-600',
      link: 'https://instagram.com/oplug_vtu'
    },
    { 
      name: 'Facebook', 
      desc: 'Join our community on Facebook', 
      icon: Facebook, 
      color: 'bg-blue-50 text-blue-800',
      iconBg: 'bg-blue-700',
      link: 'https://facebook.com/oplug_vtu'
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">{content?.title || 'Support Center'}</h1>
          <p className="text-gray-500 font-medium">{content?.subtitle || "We're here to help you 24/7 with any issues."}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Phone className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Response Time</p>
            <p className="text-sm font-black text-gray-900">{content?.responseTime || 'Under 5 Mins'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Methods */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Contact Channels</h3>
          <div className="space-y-4">
            {socialLinks.map((link: any, idx: number) => {
              const Icon = link.icon === 'MessageCircle' ? MessageCircle : 
                          link.icon === 'Mail' ? Mail :
                          link.icon === 'Instagram' ? Instagram :
                          link.icon === 'Facebook' ? Facebook : MessageCircle;
              return (
                <motion.a 
                  key={idx}
                  href={link.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-500/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", link.iconBg || 'bg-blue-500')}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 mb-1">{link.name}</h3>
                      <p className="text-xs font-bold text-gray-400">{link.desc}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-700 transition-all">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>

        {/* FAQ/Info Card */}
        <div className="space-y-6">
          <div className="bg-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">{content?.helpCardTitle || 'Need Quick Help?'}</h3>
              <p className="text-sm font-medium text-blue-100 leading-relaxed mb-8">
                {content?.helpCardText || 'Check our frequently asked questions for instant answers to common issues.'}
              </p>
              <button className="w-full bg-white text-blue-700 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
                <Globe className="w-4 h-4" />
                Visit Help Center
              </button>
            </div>
            {/* Background Decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-900 mb-6">Office Address</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-sm font-bold text-gray-700 leading-relaxed">
                    {content?.address || '123 Oplug Plaza, Digital Way, Lagos, Nigeria.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Hotline</p>
                  <p className="text-sm font-bold text-gray-700">{content?.hotline || '+234 812 345 6789'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
