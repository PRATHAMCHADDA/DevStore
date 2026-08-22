import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MapPin, CreditCard, CheckCircle, ChevronRight, Plus } from 'lucide-react';
import axios from 'axios';

const STEPS = ['Shipping Address', 'Payment Method', 'Confirm Order'];

export const Checkout = () => {
  const { user, authLoading, cart, cartLoading, cartSubtotal, clearCart, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedCouponCode = location.state?.appliedCoupon || null;
  const discountAmount = location.state?.discountAmount || 0;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchingAddr, setFetchingAddr] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddr, setNewAddr] = useState({ 
    name: '', 
    phone: '', 
    street: '', 
    city: '', 
    state: '', 
    postalCode: '', 
    country: 'United States', 
    isDefault: false 
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });

  // Order result state
  const [placedOrder, setPlacedOrder] = useState(null);

  // Address Autocomplete state
  const [suggestions, setSuggestions] = useState([]);
  const [activeSearchField, setActiveSearchField] = useState(null);
  const [isSearchingAddr, setIsSearchingAddr] = useState(false);

  const PREDEFINED_LOCATIONS = [
    { street: '742 Evergreen Terrace', city: 'Springfield', state: 'Oregon', country: 'United States', postalCode: '97477' },
    { street: '10 Downing Street', city: 'London', state: 'Greater London', country: 'United Kingdom', postalCode: 'SW1A 2AA' },
    { street: '350 5th Ave (Empire State)', city: 'New York', state: 'New York', country: 'United States', postalCode: '10118' },
    { street: '1 Infinite Loop', city: 'Cupertino', state: 'California', country: 'United States', postalCode: '95014' },
    { street: '1600 Amphitheatre Pkwy', city: 'Mountain View', state: 'California', country: 'United States', postalCode: '94043' },
    { street: 'Avenue des Champs-Élysées 75', city: 'Paris', state: 'Île-de-France', country: 'France', postalCode: '75008' },
    { street: 'Unter den Linden 77', city: 'Berlin', state: 'Berlin', country: 'Germany', postalCode: '10117' },
    { street: 'Shibuya Crossing 1-1', city: 'Tokyo', state: 'Tokyo', country: 'Japan', postalCode: '150-0042' },
    { street: '100 King St West', city: 'Toronto', state: 'Ontario', country: 'Canada', postalCode: 'M5X 1A9' },
    { street: 'George Street 200', city: 'Sydney', state: 'New South Wales', country: 'Australia', postalCode: '2000' },
    { street: 'Marine Drive 101', city: 'Mumbai', state: 'Maharashtra', country: 'India', postalCode: '400020' },
    { street: 'MG Road 45', city: 'Bengaluru', state: 'Karnataka', country: 'India', postalCode: '560001' },
    { street: 'Connaught Place Block A', city: 'New Delhi', state: 'Delhi', country: 'India', postalCode: '110001' },
    { street: 'Sheikh Zayed Rd', city: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', postalCode: '00000' }
  ];

  const subtotal = cartSubtotal || 0;
  const shippingCost = subtotal > 100 ? 0 : 10;
  const taxCost = parseFloat(((subtotal - discountAmount) * 0.15).toFixed(2));
  const grandTotal = parseFloat((subtotal - discountAmount + shippingCost + taxCost).toFixed(2));

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    fetchAddresses();
  }, [user, authLoading]);

  const fetchAddresses = async () => {
    try {
      setFetchingAddr(true);
      const res = await axios.get('/api/addresses');
      const addrs = Array.isArray(res.data) ? res.data : [];
      setAddresses(addrs);
      const def = addrs.find(a => a.isDefault) || addrs[0] || null;
      if (def) setSelectedAddress(def);
    } catch (e) {
      console.error('Failed to fetch addresses:', e);
      setAddresses([]);
    } finally {
      setFetchingAddr(false);
    }
  };

  const handleAddressInputChange = async (field, val) => {
    setNewAddr(prev => ({ ...prev, [field]: val }));

    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      setActiveSearchField(null);
      return;
    }

    setActiveSearchField(field);
    const query = val.toLowerCase();

    const localMatches = PREDEFINED_LOCATIONS.filter(item => 
      item[field]?.toLowerCase().includes(query) ||
      item.street?.toLowerCase().includes(query) ||
      item.city?.toLowerCase().includes(query) ||
      item.country?.toLowerCase().includes(query)
    );

    setSuggestions(localMatches);

    try {
      setIsSearchingAddr(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&addressdetails=1&limit=5`);
      if (res.ok) {
        const data = await res.json();
        const apiMatches = (data || []).map(place => {
          const addr = place.address || {};
          const streetStr = [addr.house_number, addr.road || addr.pedestrian || addr.suburb].filter(Boolean).join(' ') || place.display_name.split(',')[0];
          const cityStr = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
          const stateStr = addr.state || addr.region || addr.state_district || '';
          const countryStr = addr.country || '';
          const postalStr = addr.postcode || '';

          return {
            street: streetStr,
            city: cityStr,
            state: stateStr,
            country: countryStr,
            postalCode: postalStr,
            displayName: place.display_name
          };
        });

        const merged = [...localMatches];
        apiMatches.forEach(apiItem => {
          if (!merged.some(m => m.street === apiItem.street && m.city === apiItem.city)) {
            merged.push(apiItem);
          }
        });
        setSuggestions(merged);
      }
    } catch (err) {
      // Graceful fallback
    } finally {
      setIsSearchingAddr(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setNewAddr(prev => ({
      ...prev,
      street: sug.street || prev.street,
      city: sug.city || prev.city,
      state: sug.state || prev.state,
      country: sug.country || prev.country,
      postalCode: sug.postalCode || prev.postalCode
    }));
    setSuggestions([]);
    setActiveSearchField(null);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/addresses', newAddr);
      const saved = res.data?.address || res.data;
      setAddresses(prev => [...prev, saved]);
      setSelectedAddress(saved);
      setShowAddForm(false);
      setNewAddr({ name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: 'United States', isDefault: false });
      showToast('Address saved.');
    } catch (e) { 
      showToast('Failed to save address.', 'error'); 
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { 
      showToast('Please select a shipping address.', 'error'); 
      return; 
    }
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
      clearCart();
    } catch (e) {
      showToast(e.response?.data?.message || 'Order placement failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner guard while auth, cart, or addresses are loading
  if (authLoading || cartLoading || fetchingAddr) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading checkout details...</p>
      </div>
    );
  }

  // Redirect to cart if empty and order is not confirmed
  if (step !== 2 && (!cart || !cart.items || cart.items.length === 0)) {
    return <Navigate to="/cart" replace />;
  }

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

          {/* STEP 0: Shipping Address */}
          {step === 0 && (
            <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-5">
              <h2 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" /> Shipping Address
              </h2>

              {(addresses || []).length === 0 && !showAddForm && (
                <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">No addresses saved yet.</p>
                  <button onClick={() => setShowAddForm(true)} className="btn-primary py-2 px-4 text-xs cursor-pointer inline-flex items-center gap-1">
                    <Plus className="h-3.5 w-3.5" /> Add Address
                  </button>
                </div>
              )}

              {(addresses || []).map(addr => (
                <label key={addr._id || addr.id} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${selectedAddress?._id === addr._id || selectedAddress?.id === addr.id ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900'}`}>
                  <input type="radio" name="address" className="mt-1 accent-blue-500" checked={selectedAddress?._id === addr._id || selectedAddress?.id === addr.id} onChange={() => setSelectedAddress(addr)} />
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                    <p className="font-bold text-slate-900 dark:text-white">{addr.name} — {addr.phone}</p>
                    <p>{addr.street}, {addr.city}, {addr.state} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                    {addr.isDefault && <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-600 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">Default</span>}
                  </div>
                </label>
              ))}

              {(addresses || []).length > 0 && (
                <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-2 text-xs text-blue-500 font-bold hover:underline border-0 bg-transparent cursor-pointer">
                  <Plus className="h-4 w-4" /> {showAddForm ? 'Cancel' : 'Add New Address'}
                </button>
              )}

              {showAddForm && (
                <form onSubmit={handleSaveAddress} className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 relative">
                  {[['name','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State'],['postalCode','Postal Code'],['country','Country']].map(([field, label]) => {
                    const isLocationField = ['street', 'city', 'state', 'country'].includes(field);
                    return (
                      <div key={field} className={`space-y-1 relative ${field === 'street' ? 'col-span-2' : ''}`}>
                        <label className="text-[11px] font-bold text-slate-450">{label}</label>
                        <input 
                          value={newAddr[field]} 
                          onChange={e => isLocationField ? handleAddressInputChange(field, e.target.value) : setNewAddr({...newAddr, [field]: e.target.value})} 
                          onFocus={() => {
                            if (isLocationField && newAddr[field] && newAddr[field].length >= 2) {
                              handleAddressInputChange(field, newAddr[field]);
                            }
                          }}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          className={inputCls} 
                          required={field !== 'phone'} 
                        />
                        
                        {/* Dynamic Location Autocomplete Dropdown */}
                        {isLocationField && activeSearchField === field && suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[100] max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                            {suggestions.map((sug, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSuggestion(sug)}
                                className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-start gap-2 border-0 bg-transparent cursor-pointer"
                              >
                                <MapPin className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="text-xs min-w-0 flex-1">
                                  <p className="font-bold text-slate-800 dark:text-white truncate">
                                    {sug.street || sug.city || sug.country}
                                  </p>
                                  <p className="text-[10px] text-slate-400 truncate">
                                    {[sug.city, sug.state, sug.country, sug.postalCode].filter(Boolean).join(', ')}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
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

          {/* STEP 1: Payment Method */}
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

          {/* STEP 2: Order Confirmation */}
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
                <div className="flex justify-between"><span className="text-slate-400">Total Paid</span><span className="font-extrabold text-blue-600 dark:text-blue-400">${placedOrder.prices?.grandTotal || grandTotal}</span></div>
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
                {(cart?.items || []).map(item => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800">
                      <img src={item.image} alt={item.name || ''} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">× {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">${((item.discountedPrice || item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
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
