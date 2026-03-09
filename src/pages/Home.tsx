import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Wifi, Tv, Zap, GraduationCap, 
  ShieldCheck, Zap as ZapIcon, Users, ArrowRight, 
  CheckCircle2, MessageSquare, Ticket, HelpCircle,
  Star, Quote, Globe, Code
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const services = [
  { name: 'Airtime Topup', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Data Bundles', icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50' },
  { name: 'Cable TV', icon: Tv, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { name: 'Electricity', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { name: 'Education Pins', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Reseller",
    content: "Oplug has completely transformed my VTU business. The delivery is instant and the prices are the best in the market.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Ahmed Bello",
    role: "Regular User",
    content: "I love how easy it is to fund my wallet. The virtual account feature is a game changer for me.",
    avatar: "https://i.pravatar.cc/150?u=ahmed"
  },
  {
    name: "Chidi Okafor",
    role: "Developer",
    content: "The API integration was seamless. I've integrated Oplug into my own platform and it works perfectly.",
    avatar: "https://i.pravatar.cc/150?u=chidi"
  }
];

export default function Home() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6"
              >
                <ZapIcon className="w-4 h-4" />
                Fastest VTU Platform in Nigeria
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]"
              >
                {settings?.siteName || 'Oplug'} <br />
                <span className="text-blue-700">Zero Stress.</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                {settings?.siteDescription || 'Buy Data, Airtime, Cable TV, and Electricity bills at the cheapest rates. Join thousands of Nigerians using Oplug for their daily needs.'}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link to="/signup" className="w-full sm:w-auto bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-2">
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto bg-gray-50 text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center">
                  Login to Account
                </Link>
              </motion.div>
            </div>
            <div className="flex-1 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative z-10"
              >
                {/* SVG Illustration of Woman with Phone */}
                <div className="relative">
                  <img 
                    src="https://illustrations.popsy.co/blue/woman-with-smartphone.svg" 
                    alt="Woman using phone" 
                    className="w-full max-w-lg mx-auto"
                    referrerPolicy="no-referrer"
                  />
                  {/* Comic Bubble */}
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="absolute -top-4 -right-4 bg-white p-4 rounded-3xl shadow-2xl border-2 border-blue-700 max-w-[180px]"
                  >
                    <p className="text-xs font-black text-blue-700 leading-tight">
                      "1GB Data Purchase on Oplug is Successful! 🎉"
                    </p>
                    <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b-2 border-r-2 border-blue-700 rotate-45" />
                  </motion.div>
                </div>
              </motion.div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50 rounded-full blur-3xl -z-10 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Supported By Section */}
      <section className="py-12 bg-gray-50/50 border-y border-gray-100">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all">
            {settings?.supportedLogos?.length > 0 ? (
              settings.supportedLogos.map((logo: string, i: number) => (
                <img key={i} src={logo} alt="Partner" className="h-8" referrerPolicy="no-referrer" />
              ))
            ) : (
              <>
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/4b/MTN_Logo.svg" alt="MTN" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/en/9/9f/Airtel_logo.svg" alt="Airtel" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Glo_Logo.svg" alt="Glo" className="h-8" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6">Why Choose Oplug?</h2>
            <p className="text-gray-500 leading-relaxed">We provide the most reliable and affordable VTU services in Nigeria with a focus on speed and security.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Instant Delivery', desc: 'All our services are delivered instantly. No delays, no excuses.', icon: ZapIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
              { title: 'Secure Payments', desc: 'Your transactions are protected with industry-standard encryption.', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { title: '24/7 Support', desc: 'Our dedicated support team is always ready to help you.', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8", feature.bg)}>
                  <feature.icon className={cn("w-8 h-8", feature.color)} />
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Woman Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <img 
                src="https://illustrations.popsy.co/blue/woman-working-on-laptop.svg" 
                alt="Market Woman" 
                className="w-full max-w-lg mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black leading-tight">Empowering Small Businesses & Resellers</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Whether you're a market woman looking to earn extra income or a tech-savvy reseller, Oplug provides the tools you need to succeed.
              </p>
              <ul className="space-y-4">
                {[
                  'Wholesale prices for all services',
                  'Easy-to-use dashboard for tracking sales',
                  'Instant funding via virtual accounts',
                  'Dedicated reseller support group'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all">
                Become a Reseller
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1">
              <img 
                src="https://illustrations.popsy.co/blue/web-design.svg" 
                alt="API Integration" 
                className="w-full max-w-lg mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-bold">
                <Code className="w-4 h-4" />
                For Developers
              </div>
              <h2 className="text-4xl font-black leading-tight">Powerful API for Seamless Integration</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Integrate our VTU services into your own website or mobile app with our robust and well-documented API.
              </p>
              <div className="bg-gray-900 rounded-3xl p-8 font-mono text-sm text-blue-400 overflow-x-auto">
                <pre>
{`POST /api/vtu/airtime
{
  "network": "MTN",
  "amount": 1000,
  "phone": "08142452729",
  "plan_type": "VTU"
}`}
                </pre>
              </div>
              <Link to="/developer" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all">
                View API Documentation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How to Begin */}
      <section className="py-32 bg-blue-700 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6">How to Get Started</h2>
            <p className="opacity-80">Start using Oplug in three simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up for free in less than a minute.' },
              { step: '02', title: 'Fund Wallet', desc: 'Add money to your wallet via transfer or card.' },
              { step: '03', title: 'Start Buying', desc: 'Purchase any service and enjoy instant delivery.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="text-8xl font-black opacity-10 absolute -top-10 -left-4">{item.step}</span>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{item.title}</h3>
                <p className="opacity-70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6">What Our Users Say</h2>
            <p className="text-gray-500">Don't just take our word for it. Here's what our community thinks.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-gray-50 border border-gray-100 relative">
                <Quote className="absolute top-8 right-8 w-12 h-12 text-gray-200" />
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 italic mb-8 leading-relaxed">"{t.content}"</p>
                <div className="flex items-center gap-4">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-bold text-sm">{t.name}</h4>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-[3rem] p-12 lg:p-20 border border-gray-100 shadow-xl flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black leading-tight">We're Here to Help</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Have questions or need assistance? Our support team is available around the clock to ensure you have a smooth experience.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="https://wa.me/2348142452729" className="flex items-center gap-4 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 group hover:bg-emerald-100 transition-all">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">WhatsApp</p>
                    <p className="font-bold">Chat with us</p>
                  </div>
                </a>
                <Link to="/support" className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100 group hover:bg-blue-100 transition-all">
                  <div className="w-12 h-12 bg-blue-700 text-white rounded-2xl flex items-center justify-center">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">Support Ticket</p>
                    <p className="font-bold">Open a ticket</p>
                  </div>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <img 
                src="https://illustrations.popsy.co/blue/customer-support.svg" 
                alt="Support" 
                className="w-full max-w-md mx-auto"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <h2 className="text-3xl font-black tracking-tighter">OPLUG</h2>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                The most reliable VTU platform in Nigeria. We provide instant delivery of data, airtime, and bill payments at wholesale prices.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/airtime" className="hover:text-white transition-colors">Airtime</Link></li>
                <li><Link to="/data" className="hover:text-white transition-colors">Data Bundles</Link></li>
                <li><Link to="/cable" className="hover:text-white transition-colors">Cable TV</Link></li>
                <li><Link to="/electricity" className="hover:text-white transition-colors">Electricity</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
            <p>© 2026 Oplug VTU. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
