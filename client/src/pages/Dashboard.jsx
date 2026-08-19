import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  User, ShoppingBag, Heart, MapPin, Bell, Settings, 
  Download, RotateCcw, X, Star, Package, Truck, CheckCircle, Clock 
} from 'lucide-react';
import axios from 'axios';

const TABS = [
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'wishlist', label: 'Wishlist', icon: Heart },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'notifications', label: 'Notifications', icon: Bell },
];

const STATUS_ICONS = {
  processing: Clock,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: X,
};

const STATUS_COLORS = {
  processing: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  shipped: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  delivered: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  cancelled: 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

export const Dashboard = () => {
  const { user, setUser, wishlist, removeFromWishlist, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Profile edit form
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Return request modal
  const [returnModal, setReturnModal] = useState(null);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'addresses') fetchAddresses();
    if (activeTab === 'notifications') fetchNotifications();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders');
      setOrders(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/addresses');
      setAddresses(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await axios.put(`/api/orders/cancel/${orderId}`);
      showToast('Order cancelled.');
      fetchOrders();
    } catch (e) { showToast(e.response?.data?.message || 'Cannot cancel.', 'error'); }
  };

  const handleReturnRequest = async () => {
    if (!returnReason.trim()) return;
    try {
      await axios.post(`/api/orders/return/${returnModal}`, { reason: returnReason });
      showToast('Return request submitted.');
      setReturnModal(null);
      setReturnReason('');
      fetchOrders();
    } catch (e) { showToast(e.response?.data?.message || 'Return failed.', 'error'); }
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.put('/api/notifications/read-all');
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const handleDeleteNotif = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (e) { console.error(e); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await axios.put('/api/auth/profile', { name: editName, phone: editPhone });
      setUser(res.data.user);
      showToast('Profile updated!');
    } catch (e) { showToast('Update failed.', 'error'); }
    setProfileLoading(false);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await axios.delete(`/api/addresses/${id}`);
      setAddresses(addresses.filter(a => a._id !== id));
      showToast('Address removed.');
    } catch (e) { showToast('Failed.', 'error'); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Navigation */}
        <aside className="w-full md:w-56 flex-shrink-0 space-y-2">
          <div className="glass p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 text-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-extrabold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <p className="font-bold text-sm text-slate-800 dark:text-white mt-2">{user?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            <span className={`inline-block mt-2 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${user?.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'}`}>
              {user?.role}
            </span>
          </div>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setSearchParams({ tab: tab.key })}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-0 cursor-pointer ${activeTab === tab.key ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent'}`}>
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.key === 'notifications' && unreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-extrabold">{unreadCount}</span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 space-y-6">

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <div className="glass p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-6">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Profile</h2>
              <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[['Full Name', editName, setEditName, 'text'],['Email', user?.email, null, 'email'],['Phone', editPhone, setEditPhone, 'tel'],['Username', user?.username, null, 'text']].map(([label, val, setter, type]) => (
                  <div key={label} className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-450 block">{label}</label>
                    <input type={type} value={val || ''} readOnly={!setter} onChange={setter ? e => setter(e.target.value) : undefined}
                      className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${!setter ? 'opacity-60 cursor-not-allowed' : ''}`} />
                  </div>
                ))}
                <div className="col-span-full">
                  <button type="submit" disabled={profileLoading} className="btn-primary py-2.5 px-6 text-xs cursor-pointer disabled:opacity-50">
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Orders Tab ── */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Orders</h2>
              {loading ? (
                <div className="h-64 skeleton rounded-3xl"></div>
              ) : orders.length === 0 ? (
                <div className="glass py-20 text-center rounded-3xl border border-slate-200/50 dark:border-slate-800/80 text-slate-400">
                  <Package className="h-10 w-10 mx-auto mb-3" />
                  <p className="font-bold">No orders yet.</p>
                  <Link to="/shop" className="text-blue-500 hover:underline text-xs mt-1 block">Start shopping →</Link>
                </div>
              ) : (
                orders.map(order => {
                  const StatusIcon = STATUS_ICONS[order.deliveryStatus] || Clock;
                  return (
                    <div key={order._id} className="glass p-6 rounded-3xl border border-slate-200/30 dark:border-slate-800/50 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-extrabold text-slate-900 dark:text-white text-sm">Order #{order.orderId}</p>
                          <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-xl ${STATUS_COLORS[order.deliveryStatus] || STATUS_COLORS.processing}`}>
                            <StatusIcon className="h-3 w-3" />
                            {order.deliveryStatus}
                          </span>
                          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">${order.prices?.grandTotal}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800 text-xs">
                            <img src={item.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name} ×{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <a href={`/api/orders/invoice/${order._id}`} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-[11px] text-blue-500 hover:underline font-bold cursor-pointer">
                          <Download className="h-3.5 w-3.5" /> Invoice PDF
                        </a>
                        {order.deliveryStatus === 'processing' && (
                          <button onClick={() => handleCancelOrder(order.orderId)}
                            className="flex items-center gap-1.5 text-[11px] text-red-500 hover:underline font-bold border-0 bg-transparent cursor-pointer">
                            <X className="h-3.5 w-3.5" /> Cancel Order
                          </button>
                        )}
                        {order.deliveryStatus === 'delivered' && !order.returnRequest?.isRequested && (
                          <button onClick={() => setReturnModal(order.orderId)}
                            className="flex items-center gap-1.5 text-[11px] text-amber-500 hover:underline font-bold border-0 bg-transparent cursor-pointer">
                            <RotateCcw className="h-3.5 w-3.5" /> Request Return
                          </button>
                        )}
                        {order.returnRequest?.isRequested && (
                          <span className="text-[10px] font-bold text-slate-400">Return: {order.returnRequest.status}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── Wishlist Tab ── */}
          {activeTab === 'wishlist' && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Wishlist</h2>
              {(wishlist?.products || []).length === 0 ? (
                <div className="glass py-20 text-center rounded-3xl border border-slate-200/50 dark:border-slate-800/80 text-slate-400">
                  <Heart className="h-10 w-10 mx-auto mb-3" />
                  <p className="font-bold">No saved items.</p>
                  <Link to="/shop" className="text-blue-500 hover:underline text-xs mt-1 block">Discover products →</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {wishlist.products.map(prod => (
                    <div key={prod._id} className="glass rounded-2xl overflow-hidden flex border border-slate-200/30 dark:border-slate-800/50">
                      <Link to={`/product/${prod.slug}`} className="w-24 flex-shrink-0">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${prod.slug}`} className="font-bold text-sm text-slate-800 dark:text-white hover:underline line-clamp-1">{prod.name}</Link>
                          <span className="text-xs font-extrabold text-blue-500">${prod.discountedPrice || prod.price}</span>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <Link to={`/product/${prod.slug}`} className="btn-primary py-1.5 px-3 text-[10px] cursor-pointer">View</Link>
                          <button onClick={() => removeFromWishlist(prod._id)} className="text-red-500 hover:underline text-[10px] font-bold border-0 bg-transparent cursor-pointer">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Addresses Tab ── */}
          {activeTab === 'addresses' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Saved Addresses</h2>
                <Link to="/checkout" className="btn-primary py-2 px-4 text-xs cursor-pointer">+ Add via Checkout</Link>
              </div>
              {loading ? <div className="h-40 skeleton rounded-3xl"></div> : (
                addresses.length === 0 ? (
                  <div className="glass py-16 text-center rounded-3xl border border-slate-200/50 dark:border-slate-800/80 text-slate-400">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-bold text-sm">No addresses saved.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {addresses.map(addr => (
                      <div key={addr._id} className="glass p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800 dark:text-white text-sm">{addr.name}</p>
                          {addr.isDefault && <span className="text-[9px] bg-green-100 dark:bg-green-900/30 text-green-600 font-extrabold px-2 py-0.5 rounded uppercase">Default</span>}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{addr.street}, {addr.city}, {addr.state} {addr.postalCode}, {addr.country}</p>
                        <p className="text-xs text-slate-400">{addr.phone}</p>
                        <button onClick={() => handleDeleteAddress(addr._id)} className="text-[10px] text-red-500 hover:underline font-bold border-0 bg-transparent cursor-pointer">Remove</button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Notifications</h2>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-blue-500 hover:underline font-bold border-0 bg-transparent cursor-pointer">Mark all read</button>
                )}
              </div>
              {loading ? <div className="h-40 skeleton rounded-3xl"></div> : (
                notifications.length === 0 ? (
                  <div className="glass py-16 text-center rounded-3xl border border-slate-200/50 dark:border-slate-800/80 text-slate-400">
                    <Bell className="h-8 w-8 mx-auto mb-2" />
                    <p className="font-bold text-sm">No notifications yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div key={notif._id} className={`glass p-5 rounded-2xl border flex justify-between items-start gap-4 ${notif.read ? 'border-slate-200/30 dark:border-slate-800/40' : 'border-blue-200 dark:border-blue-800/50 bg-blue-50/20 dark:bg-blue-900/10'}`}>
                        <div>
                          <p className={`font-bold text-sm ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>{notif.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-1">{new Date(notif.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDeleteNotif(notif._id)} className="text-slate-300 hover:text-red-400 border-0 bg-transparent cursor-pointer flex-shrink-0">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>

      {/* Return Request Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-md w-full rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-950 space-y-5">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Request Return</h3>
            <textarea rows="4" placeholder="Describe your return reason..." value={returnReason} onChange={e => setReturnReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
            <div className="flex gap-4">
              <button onClick={() => setReturnModal(null)} className="btn-secondary flex-1 py-2.5 text-xs cursor-pointer">Cancel</button>
              <button onClick={handleReturnRequest} className="btn-primary flex-1 py-2.5 text-xs cursor-pointer">Submit Return</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
