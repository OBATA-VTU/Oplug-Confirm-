import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "Why Oplug is the Best Platform for VTU and Data in Nigeria",
    excerpt: "Discover why thousands of Nigerians trust Oplug for their daily utility needs. From lightning-fast delivery to the cheapest rates...",
    author: "Oplug Admin",
    date: "March 10, 2026",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    category: "Company News"
  },
  {
    id: 2,
    title: "How to Start Your Own VTU Business with Oplug Reseller Program",
    excerpt: "Learn how you can build a profitable business by reselling our services. We provide the tools, you provide the drive...",
    author: "Business Team",
    date: "March 08, 2026",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=800&q=80",
    category: "Tutorial"
  },
  {
    id: 3,
    title: "The Future of Fintech in Nigeria: What to Expect in 2026",
    excerpt: "As technology evolves, so does the way we handle money. Oplug is at the forefront of this revolution...",
    author: "Tech Insights",
    date: "March 05, 2026",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    category: "Fintech"
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Section */}
      <div className="bg-blue-700 py-24 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
          >
            Oplug Insights
          </motion.h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Stay updated with the latest news, tutorials, and fintech trends in Nigeria.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-12">
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-blue-100/50 border border-gray-100 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-700">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-700 transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-500 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <Link 
                  to={`/blog/${post.id}`}
                  className="inline-flex items-center gap-2 text-blue-700 font-black text-sm uppercase tracking-widest group/btn"
                >
                  Read More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-24 bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Ready to experience the best?</h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Join thousands of satisfied users and start enjoying seamless VTU services today. Oplug is undeniably the best in Nigeria.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all">
                Get Started Now
              </Link>
              <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white px-10 py-5 rounded-2xl font-black text-lg backdrop-blur-md transition-all">
                Login to Account
              </Link>
            </div>
          </div>
          <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-blue-600/20 rounded-full blur-[120px] rotate-45" />
        </div>
      </div>
    </div>
  );
}
