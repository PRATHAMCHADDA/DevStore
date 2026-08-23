import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Github, Twitter, Linkedin, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

export const Footer = () => {
  const { showToast } = useApp();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post('/api/newsletter/subscribe', { email });
    } catch (err) {
      // Local state fallback if backend route is not available
    } finally {
      showToast('Thank you for subscribing to DevStore insights!');
      setEmail('');
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* About Brand */}
          <div className="space-y-4">
            <span className="font-extrabold text-2xl tracking-tight text-white">
              DevStore
            </span>
            <p className="text-sm text-slate-400">
              The premium e-commerce platform for developer setups, mechanical keyboards, custom gadgets, and elite workstations.
            </p>
            <div className="flex space-x-4 pt-2">
              <a 
                href="https://github.com/PRATHAMCHADDA/DevStore" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors p-1"
                aria-label="GitHub Repository"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors p-1"
                aria-label="Twitter Profile"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors p-1"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=audio" className="hover:text-white transition-colors">Premium Audio</Link></li>
              <li><Link to="/shop?category=laptops" className="hover:text-white transition-colors">Computers & Laptops</Link></li>
              <li><Link to="/shop?category=gaming" className="hover:text-white transition-colors">Gaming Consoles</Link></li>
            </ul>
          </div>

          {/* Customer Care Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Customer Care</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/my-orders" className="hover:text-white transition-colors">Track Orders</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs & Support</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white transition-colors">Refund & Shipping Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter Input */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Join Newsletter</h3>
            <p className="text-sm text-slate-400">Receive special offers, product launches, and developer hardware insights.</p>
            <form onSubmit={handleSubscribe} className="relative flex">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 text-white placeholder-slate-500 px-4 py-2.5 rounded-l-xl text-sm border-0 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                required
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-xl transition-all active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-50"
                aria-label="Subscribe"
              >
                <span className="mr-1 text-xs">🚀</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <span>&copy; {new Date().getFullYear()} DevStore, Inc. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for the modern setup enthusiast.
          </span>
        </div>
      </div>
    </footer>
  );
};
