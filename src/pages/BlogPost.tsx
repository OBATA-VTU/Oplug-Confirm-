import React from 'react';
import { motion } from 'motion/react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2, MessageSquare, Heart, Bookmark } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "Why Oplug is the Best Platform for VTU and Data in Nigeria",
    content: `
      <p>In the rapidly evolving landscape of Nigerian fintech, one name has consistently stood out for its reliability, speed, and affordability: <strong>Oplug</strong>. Whether you're a casual user looking to top up your airtime or a business owner running a VTU empire, Oplug provides the most robust infrastructure in the country.</p>
      
      <h3>1. Lightning-Fast Delivery</h3>
      <p>At Oplug, we understand that time is money. Our automated systems ensure that your data, airtime, and bill payments are processed within seconds. No more waiting for hours or dealing with failed transactions. When you click "Buy", it's delivered instantly.</p>
      
      <h3>2. The Cheapest Rates in the Market</h3>
      <p>We pride ourselves on offering the most competitive prices for data and airtime. By cutting out the middlemen and working directly with major telecommunication providers, we pass the savings directly to you. Our data plans are significantly cheaper than buying directly from the networks.</p>
      
      <h3>3. 24/7 Reliability</h3>
      <p>Our platform is built on world-class infrastructure that guarantees 99.9% uptime. Whether it's 2 AM or a busy holiday weekend, Oplug is always online and ready to serve you. This reliability is why thousands of Nigerians have made us their primary utility platform.</p>
      
      <h3>4. User-Centric Design</h3>
      <p>Inspired by the best fintech apps like PalmPay, our dashboard is designed to be intuitive and easy to use. Even if you're not tech-savvy, you can navigate our services and complete transactions with ease.</p>
      
      <p><strong>Conclusion:</strong> If you're looking for the best VTU and data experience in Nigeria, look no further than Oplug. Join us today and see the difference for yourself!</p>
    `,
    author: "Oplug Admin",
    date: "March 10, 2026",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    category: "Company News"
  },
  {
    id: 2,
    title: "How to Start Your Own VTU Business with Oplug Reseller Program",
    content: `
      <p>Are you looking for a steady stream of passive income? The VTU business in Nigeria is a multi-billion naira industry, and Oplug is your perfect partner to get started. Our reseller program is designed to help you build a profitable business with minimal investment.</p>
      
      <h3>Why Choose Oplug for Your Business?</h3>
      <p>As an Oplug reseller, you get access to wholesale prices that allow you to make a significant profit on every transaction. We provide you with a personalized dashboard where you can manage your customers, track your earnings, and automate your sales.</p>
      
      <h3>Steps to Get Started:</h3>
      <ul>
        <li><strong>Register:</strong> Create a free account on Oplug.</li>
        <li><strong>Upgrade:</strong> Apply for the reseller status in your profile settings.</li>
        <li><strong>Fund:</strong> Add money to your wallet to start trading.</li>
        <li><strong>Sell:</strong> Start offering services to your friends, family, and community.</li>
      </ul>
      
      <p>Our platform is the best because we offer the most reliable API for developers and business owners. You can integrate our services into your own website or app and start earning immediately.</p>
      
      <p>Don't wait! The best time to start your VTU business was yesterday. The second best time is now. Join Oplug today!</p>
    `,
    author: "Business Team",
    date: "March 08, 2026",
    image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=1200&q=80",
    category: "Tutorial"
  },
  {
    id: 3,
    title: "The Future of Fintech in Nigeria: What to Expect in 2026",
    content: `
      <p>The Nigerian fintech space is one of the most vibrant in the world. As we move further into 2026, several trends are shaping the way we interact with money. Oplug is at the forefront of these innovations, ensuring that our users always have access to the latest financial tools.</p>
      
      <h3>1. Increased Personalization</h3>
      <p>AI and machine learning are allowing platforms like Oplug to offer personalized financial advice and services. We're moving beyond simple transactions to becoming a comprehensive financial partner for our users.</p>
      
      <h3>2. Seamless Cross-Platform Integration</h3>
      <p>The future is about connectivity. Oplug's advanced API allows for seamless integration with other platforms, making it easier than ever to manage your utilities across different apps and services.</p>
      
      <h3>3. Enhanced Security</h3>
      <p>With the rise of digital transactions comes the need for better security. Oplug uses state-of-the-art encryption and multi-factor authentication to ensure that your funds and data are always safe.</p>
      
      <p><strong>Why Oplug is the Best:</strong> While many platforms are trying to keep up, Oplug is leading the way. Our commitment to innovation and user satisfaction makes us the undisputed leader in the Nigerian VTU and utility space.</p>
    `,
    author: "Tech Insights",
    date: "March 05, 2026",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    category: "Fintech"
  }
];

export default function BlogPost() {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === Number(id));

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Post not found</h2>
          <Link to="/blog" className="text-blue-700 font-bold hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Hero Header */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl space-y-6"
            >
              <Link 
                to="/blog"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm uppercase tracking-widest mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>
              <span className="inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {post.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">
                {post.title}
              </h1>
              <div className="flex items-center gap-6 text-white/60 text-xs font-bold uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white">
                    {post.author.charAt(0)}
                  </div>
                  {post.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content */}
          <article className="flex-1 max-w-4xl">
            <div 
              className="prose prose-xl prose-blue max-w-none text-gray-600 leading-relaxed space-y-8"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            {/* Post Actions */}
            <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors font-bold text-sm">
                  <Heart className="w-5 h-5" />
                  245 Likes
                </button>
                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors font-bold text-sm">
                  <MessageSquare className="w-5 h-5" />
                  12 Comments
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                  <Bookmark className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 space-y-12">
            <div className="bg-gray-50 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xl font-black text-gray-900">Why Choose Oplug?</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Oplug is the undisputed leader in Nigerian VTU services. Our platform offers the best rates, fastest delivery, and most reliable infrastructure.
              </p>
              <Link to="/signup" className="block w-full bg-blue-700 text-white text-center py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                Join Oplug Now
              </Link>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black text-gray-900">Recent Posts</h3>
              <div className="space-y-6">
                {blogPosts.filter(p => p.id !== post.id).map(p => (
                  <Link key={p.id} to={`/blog/${p.id}`} className="flex gap-4 group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                      <img 
                        src={p.image} 
                        alt={p.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.date}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
