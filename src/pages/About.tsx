import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Target, Users, Shield, Zap } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function About() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'pages', 'about'));
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching about page content:', err);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-20 pb-32">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-20"
        >
          <div className="text-center">
            <h1 className="text-5xl lg:text-7xl font-black mb-8">{content?.title || 'About Oplug'}</h1>
            <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {content?.description || "We are Nigeria's leading VTU platform, dedicated to providing seamless digital services at the most affordable rates."}
            </p>
          </div>

          <div className="relative">
            <img 
              src={content?.heroImage || "https://illustrations.popsy.co/blue/team-work.svg"} 
              alt="Our Team" 
              className="w-full max-w-lg mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold">{content?.missionTitle || 'Our Mission'}</h3>
              <p className="text-gray-500 leading-relaxed">
                {content?.missionText || 'To empower Nigerians with easy access to digital services, enabling them to stay connected and productive without breaking the bank.'}
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-2xl font-bold">{content?.visionTitle || 'Our Vision'}</h3>
              <p className="text-gray-500 leading-relaxed">
                {content?.visionText || 'To become the most trusted and reliable digital service provider in Africa, known for our innovation and customer-centric approach.'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-[3rem] p-12 lg:p-20 text-center space-y-8">
            <h2 className="text-3xl font-black">{content?.whyTitle || 'Why Oplug?'}</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="space-y-2">
                <Zap className="w-8 h-8 text-blue-700 mx-auto" />
                <h4 className="font-bold">Instant Delivery</h4>
                <p className="text-sm text-gray-500">Automated systems for 24/7 instant service.</p>
              </div>
              <div className="space-y-2">
                <Shield className="w-8 h-8 text-blue-700 mx-auto" />
                <h4 className="font-bold">Secure Payments</h4>
                <p className="text-sm text-gray-500">Multiple secure payment options for your peace of mind.</p>
              </div>
              <div className="space-y-2">
                <Users className="w-8 h-8 text-blue-700 mx-auto" />
                <h4 className="font-bold">24/7 Support</h4>
                <p className="text-sm text-gray-500">A dedicated team ready to assist you anytime.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
