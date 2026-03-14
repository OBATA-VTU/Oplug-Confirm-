import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Privacy() {
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'pages', 'privacy'));
        if (docSnap.exists()) {
          setContent(docSnap.data());
        }
      } catch (err) {
        console.error('Error fetching privacy page content:', err);
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
          className="space-y-12"
        >
          <div className="text-center">
            <h1 className="text-5xl font-black mb-6">{content?.title || 'Privacy Policy'}</h1>
            <p className="text-gray-500">{content?.subtitle || 'How we handle your data at Oplug.'}</p>
          </div>

          <div className="prose prose-blue max-w-none space-y-8 text-gray-600 leading-relaxed">
            {content?.sections ? (
              content.sections.map((section: any, i: number) => (
                <section key={i} className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-700" />
                    {section.title}
                  </h2>
                  <p>{section.content}</p>
                </section>
              ))
            ) : (
              <>
                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-700" />
                    1. Information We Collect
                  </h2>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, fund your wallet, or contact support. This includes your name, email address, phone number, and transaction history.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-blue-700" />
                    2. How We Use Your Information
                  </h2>
                  <p>
                    We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you about your account and our services.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Eye className="w-6 h-6 text-blue-700" />
                    3. Data Sharing
                  </h2>
                  <p>
                    We do not share your personal information with third parties except as necessary to provide our services (e.g., with payment processors or network providers) or as required by law.
                  </p>
                </section>

                <section className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-700" />
                    4. Security
                  </h2>
                  <p>
                    We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
                  </p>
                </section>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
