import { Facebook, Twitter, Instagram, Mail, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

const socialLinks = [
  { name: 'Facebook', desc: 'Visit our Facebook page', icon: Facebook, color: 'bg-blue-700' },
  { name: 'Telegram', desc: 'Join our telegram update channel', icon: MessageCircle, color: 'bg-emerald-500' },
  { name: 'Instagram', desc: 'Follow us on Instagram', icon: Instagram, color: 'bg-orange-600' },
  { name: 'Twitter', desc: 'Follow us on twitter', icon: Twitter, color: 'bg-blue-400' },
  { name: 'Mail', desc: 'Send us an Email', icon: Mail, color: 'bg-indigo-700' },
];

export default function Support() {
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold mb-6">Support</h2>
      
      {socialLinks.map((link, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg", link.color)}>
            <link.icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{link.name}</h3>
            <p className="text-xs text-gray-500">{link.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
