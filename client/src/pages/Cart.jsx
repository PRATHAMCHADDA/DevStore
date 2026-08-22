import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Trash2, Plus, Minus, ArrowRight, Tag, Sparkles } from 'lucide-react';
import axios from 'axios';

export const Cart = () => {
  const { 
    cart, cartLoading, cartSubtotal, 
    updateCartQty, removeFromCart, showToast 
  } = useApp();
  
  const navigate = useNavigate();

  // Coupon entry states
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Validate coupon on backend
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const res = await axios.post('/api/coupons/validate', {
        code: couponCode,
        subtotal: cartSubtotal
      });
      setActiveCoupon(res.data.coupon);
      showToast(res.data.message || 'Coupon code applied!');
      setCouponCode('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid or expired coupon.', 'error');
      setActiveCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    showToast('Coupon code removed.');
  };

  // Computations
  let discountVal = 0;
  if (activeCoupon) {
    if (activeCoupon.discountType === 'percentage') {
      discountVal = parseFloat(((cartSubtotal * activeCoupon.discountValue) / 100).toFixed(2));
    } else {
      discountVal = activeCoupon.discountValue;
    }
    if (discountVal > cartSubtotal) discountVal = cartSubtotal; // Limit discount
  }

  const shippingCost = cartSubtotal > 100 ? 0 : (cart.items?.length > 0 ? 10 : 0);
  const taxableAmount = Math.max(0, cartSubtotal - discountVal);
  const taxCost = parseFloat((taxableAmount * 0.15).toFixed(2)); // 15% VAT Tax
  const grandTotal = parseFloat((taxableAmount + shippingCost + taxCost).toFixed(2));

  const proceedCheckout = () => {
    navigate('/checkout', {
      state: {
        appliedCoupon: activeCoupon ? activeCoupon.code : null,
        discountAmount: discountVal
      }
    });
  };

  if (cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">Shopping Cart</h1>
        <div className="h-64 skeleton rounded-3xl"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-10">Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="glass py-24 text-center rounded-3xl space-y-6 max-w-2xl mx-auto border border-slate-200/50 dark:border-slate-800/80">
          <Sparkles className="h-16 w-16 mx-auto text-blue-500 fill-blue-50" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Your cart is empty</h2>
            <p className="text-xs text-slate-400">Add premium developer gadgets to start configuring your setup</p>
          </div>
          <Link to="/shop" className="btn-primary inline-flex py-3 px-6 rounded-xl text-sm font-semibold">
            Explore Tech Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* List items column */}
          <div className="flex-1 space-y-6">
            {items.map(item => (
              <div key={item.productId} className="glass p-5 rounded-3xl border border-slate-202/20 dark:border-slate-808/30 flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Media and info */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden glass border flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                      <Link to={`/product/${item.slug}`} className="hover:underline">{item.name}</Link>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{item.slug.split('-')[0]}</span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mt-1">${item.discountedPrice}</span>
                  </div>
                </div>

                {/* Controls and prices */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12 pl-4 sm:pl-0">
                  
                  {/* Quantity edits */}
                  <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-0 bg-transparent cursor-pointer disabled:opacity-30"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-xs font-bold w-6 text-center text-slate-800 dark:text-white">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border-0 bg-transparent cursor-pointer disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Item total and Remove */}
                  <div className="flex items-center gap-6">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white w-20 text-right">
                      ${(item.discountedPrice * item.quantity).toFixed(2)}
                    </span>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-650 hover:bg-red-50/50 dark:hover:bg-red-950/20 p-2 rounded-xl border-0 bg-transparent cursor-pointer"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Pricing aggregates column */}
          <div className="w-full lg:w-96 space-y-6">
            
            {/* Coupon Application widget */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-808/85 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-500" />
                <span>Promo Code</span>
              </h3>
              
              {activeCoupon ? (
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-950/20 border border-green-200 rounded-xl px-4 py-2 text-xs">
                  <span className="text-green-600 font-bold uppercase">{activeCoupon.code} applied</span>
                  <button 
                    onClick={handleRemoveCoupon}
                    className="text-red-500 hover:underline border-0 bg-transparent cursor-pointer font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="COUPON15" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl px-3 py-2 text-xs uppercase focus:outline-none dark:text-white font-bold"
                  />
                  <button 
                    type="submit" 
                    disabled={couponLoading}
                    className="btn-primary !py-2 px-4 text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    Apply
                  </button>
                </form>
              )}
            </div>

            {/* Calculations Totals Card */}
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-808/85 space-y-6">
              <h3 className="font-bold text-slate-800 dark:text-white text-md">Order Summary</h3>

              <div className="space-y-3 border-b border-slate-100 dark:border-slate-850 pb-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800 dark:text-white">${cartSubtotal.toFixed(2)}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span className="font-bold">-${discountVal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Cost</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Tax (15%)</span>
                  <span className="font-bold text-slate-800 dark:text-white">${taxCost.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-800 dark:text-white text-sm">Grand Total</span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">${grandTotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={proceedCheckout}
                className="w-full btn-primary py-3.5 text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Checkout setup</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
