import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Star, ShoppingBag, Heart, ArrowLeft, ShieldCheck, 
  RotateCcw, Sparkles, Send, Trash2 
} from 'lucide-react';
import axios from 'axios';

export const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, addToCart, addToWishlist, removeFromWishlist, wishlist, showToast } = useApp();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gallery view
  const [activeImage, setActiveImage] = useState('');

  // Submit Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Specs Accordion
  const [activeTab, setActiveTab] = useState('description');

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch main product details & reviews
      const detailRes = await axios.get(`/api/products/${slug}`);
      setProduct(detailRes.data.product);
      setReviews(detailRes.data.reviews || []);
      setActiveImage(detailRes.data.product.images[0] || '');

      // 2. Fetch related products in category
      const relatedRes = await axios.get(
        `/api/products/related?category=${encodeURIComponent(detailRes.data.product.category)}&productId=${detailRes.data.product._id}`
      );
      setRelated(relatedRes.data || []);
    } catch (err) {
      showToast('Product not found / error loading details.', 'error');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showToast('You must be signed in to submit reviews.', 'error');
      return;
    }
    if (!comment.trim()) return;

    try {
      const res = await axios.post('/api/reviews', {
        productId: product._id,
        rating,
        comment
      });
      // Append to reviews list
      setReviews([res.data.review, ...reviews]);
      showToast(res.data.message || 'Review submitted!');
      setComment('');
      
      // Refresh details to update average ratings on page
      const details = await axios.get(`/api/products/${slug}`);
      setProduct(details.data.product);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(`/api/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r._id !== reviewId));
      showToast('Review deleted.');

      // Refresh average ratings
      const details = await axios.get(`/api/products/${slug}`);
      setProduct(details.data.product);
    } catch (err) {
      showToast('Failed to delete review.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
        <div className="h-6 w-32 skeleton rounded"></div>
        <div className="flex flex-col md:grid md:grid-cols-2 gap-12">
          <div className="h-96 skeleton rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-10 w-3/4 skeleton rounded"></div>
            <div className="h-6 w-1/4 skeleton rounded"></div>
            <div className="h-28 skeleton rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const activePrice = product.discountedPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">
      
      {/* Back button */}
      <div>
        <Link to="/shop" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* --- Main Info Grid --- */}
      <section className="flex flex-col md:grid md:grid-cols-2 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="w-full space-y-4">
          <div className="w-full aspect-square rounded-3xl overflow-hidden glass border border-slate-205 dark:border-slate-800">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 bg-transparent cursor-pointer ${activeImage === img ? 'border-blue-500' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Custom attributes details */}
        <div className="w-full space-y-6">
          <div>
            <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider">{product.category}</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white mt-1 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-slate-400">Brand: <strong>{product.brand}</strong></span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <div className="flex text-amber-500">
                  {Array.from({ length: Math.round(product.ratings || 5) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-650 dark:text-slate-350">{product.ratings || 0} ({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          <div className="pb-6 border-b border-slate-100 dark:border-slate-850 pt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
              ${activePrice}
            </span>
            {product.discountedPrice && (
              <span className="text-md line-through text-slate-440">
                ${product.price}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Stock inventory badges */}
          <div>
            <span className={`text-xs px-3 py-1.5 rounded-xl font-bold inline-flex items-center gap-1.5 ${product.stock > 0 ? 'bg-green-50 text-green-600 dark:bg-green-950/20' : 'bg-red-50 text-red-650 dark:bg-red-950/20'}`}>
              <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{product.stock > 0 ? `In Stock (${product.stock} items left)` : 'Out of Stock'}</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <button 
              disabled={product.stock === 0}
              onClick={() => addToCart(product._id, 1)}
              className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>
            {(() => {
              const isWishlisted = (wishlist?.products || []).some(p => p._id === product._id);
              return (
                <button 
                  onClick={() => isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product._id)}
                  className={`!p-3.5 flex items-center justify-center rounded-xl cursor-pointer transition-all border ${
                    isWishlisted 
                      ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40' 
                      : 'bg-white border-slate-200 dark:bg-dark-card dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`h-5 w-5 transition-all ${
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500 dark:text-slate-400'
                  }`} />
                </button>
              );
            })()}
          </div>

          {/* Core assurances info */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <span className="text-[11px] text-slate-550 dark:text-slate-400">1 Year Direct Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-indigo-500 flex-shrink-0" />
              <span className="text-[11px] text-slate-550 dark:text-slate-400">30 Day Return Guarantee</span>
            </div>
          </div>

        </div>
      </section>

      {/* --- Middle Tabs: Specifications & Technical grids --- */}
      <section className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
        <div className="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/85">
          <button 
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 font-bold text-xs uppercase cursor-pointer border-0 ${activeTab === 'description' ? 'bg-white dark:bg-slate-950 text-blue-600' : 'text-slate-450 background-transparent'}`}
          >
            Item Overview
          </button>
          <button 
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-4 font-bold text-xs uppercase cursor-pointer border-0 ${activeTab === 'specs' ? 'bg-white dark:bg-slate-950 text-blue-600' : 'text-slate-450 background-transparent'}`}
          >
            Technical Specs
          </button>
        </div>
        <div className="p-8 text-slate-650 dark:text-slate-350 text-xs leading-relaxed space-y-4">
          {activeTab === 'description' ? (
            <div className="space-y-4">
              <p>Experience peak workstation efficiency. Engineered using premium grade components and tested under intense developer workflows, this product guarantees durability and optimal response times.</p>
              <div className="flex items-center gap-1.5 text-blue-500">
                <Sparkles className="h-4 hover:scale-110 transition-transform" />
                <span className="font-bold">Pro Edition Features loaded.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-bold text-slate-400">Connectivity</span>
                <span>Wireless 2.4G & Bluetooth 5.2</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-bold text-slate-400">Compatibility</span>
                <span>macOS, Linux, Windows</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-bold text-slate-400">Weight</span>
                <span>1.2 lbs / 540 grams</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-bold text-slate-400">Power Source</span>
                <span>USB-C Rechargeable Li-Ion</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- Customer Reviews Submission & List --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* Write a Review Form */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Customer Reviews</h2>
            <p className="text-xs text-slate-400">Share your setup feedback with other developers</p>
          </div>

          <form onSubmit={handleAddReview} className="glass p-6 rounded-3xl border border-slate-202 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-750 dark:text-slate-200 text-sm">Write Review</h3>
            
            {/* Rating Stars clickable choice */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-450 block">Star Rating</label>
              <div className="flex gap-1.5 text-amber-500">
                {[1, 2, 3, 4, 5].map(nu => (
                  <button
                    key={nu}
                    type="button"
                    onClick={() => setRating(nu)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-900 border-0 bg-transparent cursor-pointer"
                  >
                    <Star className={`h-6 w-6 ${nu <= rating ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Text */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-450 block font-semibold">Review Comment</label>
              <textarea
                rows="4"
                placeholder="Writing setup compatibility comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer">
              <Send className="h-3.5 w-3.5" />
              <span>Submit Review</span>
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-800 dark:text-white text-md">Customer Feedback ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <div className="glass py-12 text-center rounded-3xl text-xs text-slate-400">
              No reviews registered yet for this product. Be the first to write one!
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map(rev => (
                <div key={rev._id} className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-900 flex justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-805 dark:text-slate-200">{rev.userName}</span>
                      <span className="text-[10px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-sans leading-relaxed">{rev.comment}</p>
                  </div>

                  {/* Option to delete review (owner or admin) */}
                  {(user && (user.id === rev.userId || user.role === 'admin')) && (
                    <button 
                      onClick={() => handleDeleteReview(rev._id)}
                      className="text-red-500 hover:text-red-650 p-2 rounded-xl hover:bg-red-50/50 dark:hover:bg-red-950/20 border-0 bg-transparent cursor-pointer h-fit"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* --- Recommendations / Related Products --- */}
      {related.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Related Workstation Gear</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {related.map(prod => (
              <div key={prod._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-colors border border-slate-205/20 dark:border-slate-801/30 flex flex-col justify-between">
                <Link to={`/product/${prod.slug}`} className="relative h-44 overflow-hidden block">
                  <img src={prod.images[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </Link>
                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-1">
                    <Link to={`/product/${prod.slug}`} className="hover:underline">{prod.name}</Link>
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-500">${prod.price}</span>
                    <Link to={`/product/${prod.slug}`} className="text-[10px] text-slate-450 hover:underline font-bold">Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
