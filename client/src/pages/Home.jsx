import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, ArrowRight, Zap, Award, ShieldCheck, 
  RotateCcw, Star, ChevronDown, CheckCircle, Heart
} from 'lucide-react';
import axios from 'axios';

export const Home = () => {
  const { addToCart, showToast, addToWishlist, removeFromWishlist, wishlist } = useApp();
  const navigate = useNavigate();

  // Catalog Feeds
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [deals, setDeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer for Deals
  const [timerText, setTimerText] = useState('06h 42m 15s');

  useEffect(() => {
    // 24 Hour Countdown Simulation
    const timerInterval = setInterval(() => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      
      const diff = end - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      const hText = hours.toString().padStart(2, '0');
      const mText = mins.toString().padStart(2, '0');
      const sText = secs.toString().padStart(2, '0');

      setTimerText(`${hText}h ${mText}m ${sText}s`);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  useEffect(() => {
    const fetchFeeds = async () => {
      setLoading(true);
      try {
        const [featRes, trendRes, dealRes, catRes] = await Promise.all([
          axios.get('/api/products/featured'),
          axios.get('/api/products/trending'),
          axios.get('/api/products/deals'),
          axios.get('/api/products/categories')
        ]);
        setFeatured(featRes.data);
        setTrending(trendRes.data);
        setDeals(dealRes.data);
        setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load homepage feeds:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  const handleBuyNow = async (productId) => {
    const added = await addToCart(productId, 1);
    if (added) navigate('/cart');
  };

  // Static Testimonials
  const testimonials = [
    { name: 'Sarah Connor', role: 'DevOps Engineer', text: 'The Apple MacBook Pro M3 Max is a powerhouse. Setup was fully configured. Customer service responded in minutes.', rating: 5 },
    { name: 'Marcus Aurelius', role: 'Software Architect', text: 'DevStore has the best mechanical setups. The Custom keyboard switches and the fast DHL shipping got me hooked.', rating: 5 },
    { name: 'Elena Rostova', role: 'AI Researcher', text: 'Exceptional noise cancellation on the Bose Ultra buds. Dynamic recommendations found exactly what I wanted.', rating: 4 }
  ];

  // FAQ Accordion Toggle
  const [faqOpen, setFaqOpen] = useState(null);
  const faqs = [
    { q: 'Is there a warranty on developer setups?', a: 'Yes! All electronics products come with a 1-Year DevStore Direct Replacement Warranty.' },
    { q: 'How fast is standard shipping?', a: 'Standard shipping takes 3-5 business days. Express shipping delivers within 48 hours.' },
    { q: 'How does the Return system work?', a: 'Once an order is marked delivered, you can submit a return request inside your dashboard within 30 days.' }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4 md:px-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 border border-blue-200 text-blue-600 dark:bg-blue-900/30 dark:border-blue-800 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 fill-blue-500" />
              <span>FLASH SALE: 15% OFF ALL TECH STUFF</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              Upgrade Your <br />
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                Developer Setup
              </span>
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-dark-muted max-w-lg">
              Explore custom keyboards, high-performance laptop stations, studio audio gear, and elite desk accessories designed to maximize productivity.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/shop" className="btn-primary flex items-center justify-center gap-2">
                <span>Explore Shop</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#deals" className="btn-secondary flex items-center justify-center gap-2">
                <span>Today's Deals</span>
              </a>
            </div>
          </motion.div>

          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full z-0"></div>
            <img 
              src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800" 
              alt="MacBook Setup station" 
              className="relative z-10 w-full max-w-md h-auto rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800"
            />
          </motion.div>

        </div>
      </section>

      {/* 2. Selling Badges / Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="glass px-6 py-6 rounded-2xl flex flex-col items-center text-center gap-3">
            <Award className="h-9 w-9 text-blue-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Premium Quality</h3>
            <p className="text-xs text-slate-400">Curated hardware setups</p>
          </div>
          <div className="glass px-6 py-6 rounded-2xl flex flex-col items-center text-center gap-3">
            <ShieldCheck className="h-9 w-9 text-green-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">Secure checkout</h3>
            <p className="text-xs text-slate-400">Stripe and Paypal enabled</p>
          </div>
          <div className="glass px-6 py-6 rounded-2xl flex flex-col items-center text-center gap-3">
            <RotateCcw className="h-9 w-9 text-indigo-500" />
            <h3 className="font-bold text-slate-800 dark:text-white">30 Day Returns</h3>
            <p className="text-xs text-slate-400">Instant cancellations</p>
          </div>
          <div className="glass px-6 py-6 rounded-2xl flex flex-col items-center text-center gap-3">
            <CheckCircle className="h-9 w-9 text-blue-400" />
            <h3 className="font-bold text-slate-800 dark:text-white">Professional support</h3>
            <p className="text-xs text-slate-400">24/7 client operations</p>
          </div>
        </div>
      </section>

      {/* 3. Flash Deals Section */}
      <section id="deals" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">Today's Flash Deals</h2>
            <p className="text-xs text-slate-400">Limited quantities left at these special prices</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-red-100 dark:bg-red-950/30 text-red-500 font-bold border border-red-200/50">
            <Zap className="h-4.5 w-4.5 fill-red-500 animate-pulse" />
            <span>Time Left: {timerText}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 skeleton rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {deals.map(prod => (
              <div key={prod._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all flex flex-col border border-slate-200/40 dark:border-slate-800/40">
                <Link to={`/product/${prod.slug}`} className="relative h-48 overflow-hidden block">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded-md">
                    -{Math.round(((prod.price - prod.discountedPrice)/prod.price)*100)}%
                  </span>
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">
                      <Link to={`/product/${prod.slug}`} className="hover:underline">{prod.name}</Link>
                    </h3>
                    <span className="text-xs text-slate-400">{prod.brand}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div>
                      <span className="text-md font-extrabold text-blue-600 dark:text-blue-400">${prod.discountedPrice}</span>
                      <span className="text-xs line-through text-slate-400 ml-1.5">${prod.price}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {(() => {
                        const isWishlisted = (wishlist?.products || []).some(p => p._id === prod._id);
                        return (
                          <button 
                            onClick={() => isWishlisted ? removeFromWishlist(prod._id) : addToWishlist(prod._id)}
                            className={`p-2 rounded-xl transition-all border-0 cursor-pointer ${
                              isWishlisted
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30'
                                : 'bg-slate-100/70 text-slate-400 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                          </button>
                        );
                      })()}
                      <button 
                        onClick={() => addToCart(prod._id, 1)}
                        className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors border-0"
                      >
                        <ShoppingBag className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Display Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
          {categories.slice(0, 5).map(cat => (
            <Link 
              key={cat._id}
              to={`/shop?category=${encodeURIComponent(cat.name)}`} 
              className="glass p-5 rounded-2xl hover:scale-[1.03] transition-all flex flex-col items-center gap-4 text-center border border-slate-200/50 dark:border-slate-800/80"
            >
              <img src={cat.image} className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700" alt={cat.name} />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Featured Lists */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-8">Featured Station Hardware</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-80 skeleton rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(prod => (
              <div key={prod._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all flex flex-col border border-slate-200/40 dark:border-slate-800/40">
                <Link to={`/product/${prod.slug}`} className="relative h-48 overflow-hidden block">
                  <img 
                    src={prod.images[0]} 
                    alt={prod.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.ratings > 4.7 && (
                    <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-1 rounded-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      <span>TOP</span>
                    </span>
                  )}
                </Link>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1">
                      <Link to={`/product/${prod.slug}`} className="hover:underline">{prod.name}</Link>
                    </h3>
                    <span className="text-xs text-slate-400">{prod.brand}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-md font-extrabold text-slate-900 dark:text-white">${prod.price}</span>
                    <div className="flex gap-1.5">
                      {(() => {
                        const isWishlisted = (wishlist?.products || []).some(p => p._id === prod._id);
                        return (
                          <button 
                            onClick={() => isWishlisted ? removeFromWishlist(prod._id) : addToWishlist(prod._id)}
                            className={`p-2 rounded-xl transition-all border-0 cursor-pointer ${
                              isWishlisted
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30'
                                : 'bg-slate-100/70 text-slate-400 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800'
                            }`}
                          >
                            <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                          </button>
                        );
                      })()}
                      <button 
                        onClick={() => handleBuyNow(prod._id)}
                        className="btn-primary py-1.5 px-3.5 text-xs !rounded-xl"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white text-center mb-12">Developer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex flex-col justify-between gap-4">
              <p className="text-sm italic text-slate-500 dark:text-slate-400">"{t.text}"</p>
              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{t.name}</h4>
                  <span className="text-xs text-slate-400">{t.role}</span>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. FAQs Accordion */}
      <section className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/80">
              <button 
                onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-slate-50 dark:hover:bg-slate-900 border-0 bg-transparent cursor-pointer"
              >
                <span className="font-semibold text-slate-800 dark:text-white text-sm">{faq.q}</span>
                <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${faqOpen === idx ? 'rotate-180' : ''}`} />
              </button>
              {faqOpen === idx && (
                <div className="px-6 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
