import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, CreditCard, CheckCircle, ChevronRight, Plus } from 'lucide-react';
import axios from 'axios';

const STEPS = ['Shipping Address', 'Payment Method', 'Confirm Order'];

export const Checkout = () => {
  const { user, cart, cartSubtotal, clearCart, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedCouponCode = location.state?.appliedCoupon || null;
  const discountAmount = location.state?.discountAmount || 0;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddr, setNewAddr] = useState({ name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'United States', isDefault: false });
  const [showAddForm, setShowAddForm] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });

  // Order result
  const [placedOrder, setPlacedOrder] = useState(null);

  const shippingCost = cartSubtotal > 100 ? 0 : 10;
  const taxCost = parseFloat(((cartSubtotal - discountAmount) * 0.15).toFixed(2));
  const grandTotal = parseFloat((cartSubtotal - discountAmount + shippingCost + taxCost).toFixed(2));

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get('/api/addresses');
      setAddresses(res.data);
      const def = res.data.find(a => a.isDefault);
      if (def) setSelectedAddress(def);
    } catch (e) { console.error(e); }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/addresses', newAddr);
      setAddresses([...addresses, res.data.address]);
      setSelectedAddress(res.data.address);
      setShowAddForm(false);
      setNewAddr({ name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'United States', isDefault: false });
      showToast('Address saved.');
    } catch (e) { showToast('Failed to save address.', 'error'); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { showToast('Please select a shipping address.', 'error'); return; }
    setLoading(true);
    try {
      const gatewayData = paymentMethod === 'card' ? { cardDetails } : {};
      const res = await axios.post('/api/orders', {
        shippingAddress: selectedAddress,
        paymentMethod,
        couponCode: appliedCouponCode,
        gatewayData
      });
      setPlacedOrder(res.data.order);
      setStep(2);
    } catch (e) {
      showToast(e.response?.data?.message || 'Order placement failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Checkout</h1>

      {/* Step progress bar */}
      <div className="flex items-center gap-3">
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 text-xs font-bold ${i <= step ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold ${i < step ? 'bg-blue-500 text-white' : i === step ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
              </span>
              <span className="hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 space-y-6">

          {/* STEP 0: Shipping */}
          {step === 0 && (
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-5">
              <h2 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" /> Shipping Address
              </h2>

              {addresses.map(addr => (
                <label key={addr._id} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                  <input type="radio" name="address" className="mt-1 accent-blue-500" checked={selectedAddress?._id === addr._id} onChange={() => setSelectedAddress(addr)} />
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">{addr.name} — {addr.phone}</p>
                    <p>{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                    {addr.isDefault && <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">Default</span>}
                  </div>
                </label>
              ))}

              <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 text-xs text-blue-500 font-bold hover:underline border-0 bg-transparent cursor-pointer">
                <Plus className="h-4 w-4" /> {showAddForm ? 'Cancel' : 'Add New Address'}
              </button>

              {showAddForm && (
                <form onSubmit={handleSaveAddress} className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {[['name','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State'],['postalCode','Postal Code'],['country','Country']].map(([field, label]) => (
                    <div key={field} className={`space-y-1 ${field === 'street' ? 'col-span-2' : ''}`}>
                      <label className="text-[11px] font-bold text-slate-450">{label}</label>
                      <input value={newAddr[field]} onChange={e => setNewAddr({...newAddr, [field]: e.target.value})} className={inputCls} required />
                    </div>
                  ))}
                  <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" id="defAddr" checked={newAddr.isDefault} onChange={e => setNewAddr({...newAddr, isDefault: e.target.checked})} className="accent-blue-500" />
                    <label htmlFor="defAddr" className="text-xs text-slate-600 dark:text-slate-400">Set as default address</label>
                  </div>
                  <div className="col-span-2">
                    <button type="submit" className="btn-primary py-2 px-6 text-xs cursor-pointer">Save Address</button>
                  </div>
                </form>
              )}

              <button disabled={!selectedAddress} onClick={() => setStep(1)} className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                Continue to Payment <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 1: Payment */}
          {step === 1 && (
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-5">
              <h2 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-500" /> Payment Method
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[['card','💳 Card'],['cod','📦 Cash on Delivery'],['paypal','🅿️ PayPal'],['razorpay','🔷 Razorpay']].map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setPaymentMethod(val)}
                    className={`py-3 px-2 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${paymentMethod === val ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                    <span className="text-lg">{label.split(' ')[0]}</span>
                    <span>{label.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Card Details</p>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-450">Card Number</label>
                    <input placeholder="4242 4242 4242 4242" value={cardDetails.number} onChange={e => setCardDetails({...cardDetails, number: e.target.value})} className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-450">Cardholder Name</label>
                    <input placeholder="John Doe" value={cardDetails.name} onChange={e => setCardDetails({...cardDetails, name: e.target.value})} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-450">Expiry (MM/YY)</label>
                      <input placeholder="12/27" value={cardDetails.expiry} onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-450">CVC</label>
                      <input placeholder="123" value={cardDetails.cvc} onChange={e => setCardDetails({...cardDetails, cvc: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}

              {(paymentMethod === 'paypal' || paymentMethod === 'razorpay') && (
                <div className="text-center py-8 text-xs text-slate-400 glass rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="font-bold">You'll be redirected to {paymentMethod === 'paypal' ? 'PayPal' : 'Razorpay'} after confirming.</p>
                  <p className="mt-1">Test sandbox mode is active.</p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="text-center py-8 text-xs text-slate-400 glass rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="font-bold">Pay cash when your package arrives. No upfront payment needed.</p>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(0)} className="btn-secondary py-2.5 text-sm flex-1 cursor-pointer">Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary py-2.5 text-sm flex-1 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                  {loading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Confirmation */}
          {step === 2 && placedOrder && (
            <div className="glass p-10 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order Confirmed!</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Thank you for your purchase. Your order is being processed.</p>
              </div>
              <div className="glass p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Order ID</span><span className="font-bold text-slate-800 dark:text-white">{placedOrder.orderId}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Payment</span><span className="font-bold text-slate-800 dark:text-white uppercase">{placedOrder.paymentMethod}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Total Paid</span><span className="font-extrabold text-blue-600 dark:text-blue-400">${placedOrder.prices.grandTotal}</span></div>
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={() => navigate('/dashboard?tab=orders')} className="btn-primary py-2.5 px-6 text-sm cursor-pointer">View Orders</button>
                <button onClick={() => navigate('/shop')} className="btn-secondary py-2.5 px-6 text-sm cursor-pointer">Continue Shopping</button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Side Panel */}
        {step < 2 && (
          <div className="w-full lg:w-80 space-y-4">
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
              <h3 className="font-extrabold text-slate-800 dark:text-white">Order Summary</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {(cart.items || []).map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">× {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">${(item.discountedPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${cartSubtotal.toFixed(2)}</span></div>
                {discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Coupon Discount</span><span>-${discountAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `$${shippingCost}`}</span></div>
                <div className="flex justify-between text-slate-500"><span>Tax (15%)</span><span>${taxCost}</span></div>
                <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-sm border-t border-slate-100 dark:border-slate-800 pt-2">
                  <span>Grand Total</span><span className="text-blue-600 dark:text-blue-400">${grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
