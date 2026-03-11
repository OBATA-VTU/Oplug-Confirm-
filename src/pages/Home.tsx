import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Smartphone, Wifi, Tv, Zap, GraduationCap, 
  ShieldCheck, Zap as ZapIcon, Users, ArrowRight, 
  CheckCircle2, MessageSquare, Ticket, HelpCircle,
  Star, Quote, Globe, Code, Layout, Shield, CreditCard, Landmark, Wallet,
  LayoutDashboard, Menu, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [settings, setSettings] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

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
      {/* Navigation */}
      <nav className="h-24 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-[100] px-6">
        <div className="container mx-auto h-full flex items-center justify-between">
          <Logo />
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            <Link to="/pricing" className="text-sm font-bold text-gray-500 hover:text-blue-700 transition-colors">Pricing</Link>
            <Link to="/blog" className="text-sm font-bold text-gray-500 hover:text-blue-700 transition-colors">Blog</Link>
            <Link to="/about" className="text-sm font-bold text-gray-500 hover:text-blue-700 transition-colors">About Us</Link>
            <Link to="/developer" className="text-sm font-bold text-gray-500 hover:text-blue-700 transition-colors">Developers</Link>
            
            {user ? (
              <Link to="/dashboard" className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-100 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-blue-700 hover:underline">Login</Link>
                <Link to="/signup" className="bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-100">
                  Create Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-24 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 lg:hidden shadow-xl z-50"
          >
            <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900">Pricing</Link>
            <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900">Blog</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900">About Us</Link>
            <Link to="/developer" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-gray-900">Developers</Link>
            <div className="h-px bg-gray-100 my-2" />
            {user ? (
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-center">
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-center font-bold text-blue-700 py-2">Login</Link>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-center">
                  Create Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </nav>

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
                className="text-5xl lg:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9]"
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
                {user ? (
                  <Link to="/dashboard" className="w-full sm:w-auto bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-2">
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" className="w-full sm:w-auto bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-800 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-2">
                      Get Started Now
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto bg-gray-50 text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center">
                      Login to Account
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
            <div className="flex-1 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative z-10"
              >
                <div className="relative min-h-[400px] flex items-center justify-center">
                  <img 
                    src={settings?.heroImage || "https://images.unsplash.com/photo-1556157382-97dee2dcb756?auto=format&fit=crop&q=80&w=1000"} 
                    alt="Man using phone" 
                    className="w-full max-w-lg mx-auto drop-shadow-2xl rounded-[3rem]"
                    referrerPolicy="no-referrer"
                  />
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.2, type: 'spring' }}
                    className="absolute -top-4 -right-4 bg-white p-4 rounded-3xl shadow-2xl border-2 border-blue-700 max-w-[180px]"
                  >
                    <p className="text-xs font-black text-blue-700 leading-tight flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      "1GB Data Purchase on Oplug is Successful!"
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

      {/* Partners Section */}
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

      {/* Services Grid */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6">Our Services</h2>
            <p className="text-gray-500">Everything you need for your digital life, all in one place.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: 'Airtime', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50', link: '/airtime' },
              { name: 'Data', icon: Wifi, color: 'text-purple-600', bg: 'bg-purple-50', link: '/data' },
              { name: 'Cable TV', icon: Tv, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/cable' },
              { name: 'Electricity', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', link: '/electricity' },
              { name: 'Education', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/education' },
            ].map((service, i) => (
              <Link key={i} to={service.link} className="p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform", service.bg)}>
                  <service.icon className={cn("w-8 h-8", service.color)} />
                </div>
                <h3 className="font-bold text-gray-900">{service.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Fast Delivery Section */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <img 
                src={settings?.fastDeliveryImage || "https://illustrations.popsy.co/blue/man-on-rocket.svg"} 
                alt="Fast Delivery" 
                className="w-full max-w-lg mx-auto drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black leading-tight">Lightning Fast Delivery</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                We know your time is valuable. That's why our automated system ensures that all your purchases are delivered instantly, 24/7.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-3xl border border-gray-100">
                  <h4 className="font-bold text-blue-700 text-2xl mb-1">99.9%</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Uptime</p>
                </div>
                <div className="p-6 bg-white rounded-3xl border border-gray-100">
                  <h4 className="font-bold text-blue-700 text-2xl mb-1">&lt; 2s</h4>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Delivery Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reseller Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1">
              <img 
                src={settings?.resellerImage || "https://illustrations.popsy.co/blue/shaking-hands.svg"} 
                alt="Partnership" 
                className="w-full max-w-lg mx-auto drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black leading-tight">Earn More as a Reseller</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Join our network of successful resellers and start earning today. We offer the best wholesale prices and a dedicated dashboard to manage your business.
              </p>
              <ul className="space-y-4">
                {[
                  'Exclusive wholesale discounts',
                  'Custom branding options',
                  'Priority customer support',
                  'Detailed sales analytics'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className="inline-flex items-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-800 transition-all shadow-xl shadow-blue-100">
                Start Reselling
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <img 
                src={settings?.developerImage || "https://illustrations.popsy.co/white/web-design.svg"} 
                alt="API Integration" 
                className="w-full max-w-lg mx-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold">
                <Code className="w-4 h-4" />
                Developer Friendly
              </div>
              <h2 className="text-4xl font-black leading-tight">Robust API for Developers</h2>
              <p className="text-lg text-blue-100/60 leading-relaxed">
                Integrate our services into your own applications with ease. Our API is well-documented, secure, and highly reliable.
              </p>
              <div className="bg-black/50 rounded-3xl p-8 font-mono text-sm text-blue-400 border border-white/5">
                <pre className="overflow-x-auto">
{`POST /api/v1/data/purchase
{
  "network": "MTN",
  "plan_id": "1GB",
  "phone": "08142452729"
}`}
                </pre>
              </div>
              <Link to="/developer/docs" className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                API Documentation
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]" />
      </section>

      {/* Funding Section */}
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1">
              <img 
                src={settings?.fundingImage || "https://illustrations.popsy.co/blue/payment-processed.svg"} 
                alt="Easy Funding" 
                className="w-full max-w-lg mx-auto drop-shadow-xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black leading-tight">Hassle-Free Funding</h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                Fund your wallet instantly using any of our multiple payment methods. From automatic virtual accounts to secure card payments.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Virtual Accounts', icon: Landmark, desc: 'Permanent accounts for instant funding.' },
                  { title: 'Card Payments', icon: CreditCard, desc: 'Secure payments via Paystack.' },
                  { title: 'Manual Transfer', icon: Wallet, desc: 'Direct bank transfers with proof upload.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <item.icon className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6">What Our Users Say</h2>
            <p className="text-gray-500">Join thousands of satisfied users who trust Oplug for their daily digital needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah J.', role: 'Reseller', content: 'The best VTU platform I have ever used. Delivery is truly instant!', avatar: 'https://i.pravatar.cc/150?u=1' },
              { name: 'Michael O.', role: 'Developer', content: 'The API is so easy to integrate. My app was up and running in minutes.', avatar: 'https://i.pravatar.cc/150?u=2' },
              { name: 'Blessing E.', role: 'User', content: 'I love the virtual account feature. Funding my wallet is so easy now.', avatar: 'https://i.pravatar.cc/150?u=3' },
            ].map((t, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 italic mb-8">"{t.content}"</p>
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
      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="bg-blue-700 rounded-[3.5rem] p-12 lg:p-24 text-white flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
            <div className="flex-1 space-y-8 relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight">Need Help? We're Always Online.</h2>
              <p className="text-xl text-blue-100 leading-relaxed">
                Our support team is available 24/7 to assist you with any questions or issues you might have.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/2348142452729" className="bg-white text-blue-700 px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  WhatsApp Support
                </a>
                <Link to="/support" className="bg-blue-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-900 transition-all flex items-center gap-2 border border-white/10">
                  <Ticket className="w-5 h-5" />
                  Open Support Ticket
                </Link>
              </div>
            </div>
            <div className="flex-1 relative z-10">
              <img 
                src={settings?.supportImage || "https://illustrations.popsy.co/blue/customer-support.svg"} 
                alt="Support" 
                className="w-full max-w-md mx-auto drop-shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute top-0 right-0 w-[50%] h-full bg-white/5 -skew-x-12 translate-x-1/2" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2 space-y-6">
              <Logo variant="white" />
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
