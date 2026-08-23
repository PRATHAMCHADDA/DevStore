import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, Package, Users, ShoppingBag, Tag, 
  TrendingUp, AlertTriangle, Plus, Pencil, Trash2, X, Save,
  CheckCircle, XCircle, ShieldCheck, Lock
} from 'lucide-react';
import axios from 'axios';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend
} from 'recharts';

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'coupons', label: 'Coupons', icon: Tag },
];

export const AdminPanel = () => {
  const { user, login, showToast } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Dedicated Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState('');

  // Stats
  const [stats, setStats] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // CRUD data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // Modals
  const [productModal, setProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name:'', price:'', description:'', category:'', brand:'', stock:'', isFeatured: false, images: '' });

  const [couponModal, setCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({ code:'', discountType:'percentage', discountValue:'', minPurchase:'0', expiryDate:'', usageLimit:'100' });

  const userId = user?.id || user?._id;
  const userRole = user?.role;

  useEffect(() => {
    if (userRole !== 'admin') return;

    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'dashboard') { fetchStats(); fetchAnalytics(); }
  }, [activeTab, userRole, userId]);

  // Clean background polling every 10 seconds without screen flashing
  useEffect(() => {
    if (userRole !== 'admin') return;

    const interval = setInterval(() => {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'coupons') fetchCoupons();
      if (activeTab === 'dashboard') { fetchStats(); fetchAnalytics(); }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab, userRole]);

  const handleAdminSignIn = async (e) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setAdminLoginError('Please enter both admin email and password.');
      return;
    }
    setAdminLoginLoading(true);
    setAdminLoginError('');
    try {
      const res = await login(adminEmail, adminPassword);
      setAdminLoginLoading(false);
      if (!res.success) {
        setAdminLoginError(res.message || 'Invalid admin credentials.');
      } else if (res.user?.role !== 'admin') {
        setAdminLoginError('Access denied: Account does not have administrator privileges.');
      } else {
        showToast('Admin Console Unlocked!', 'success');
      }
    } catch (err) {
      setAdminLoginLoading(false);
      setAdminLoginError('Authentication failed. Please check your credentials.');
    }
  };

  const handleFillCredentials = () => {
    setAdminEmail('admin@devstore.com');
    setAdminPassword('Admin123!');
  };

  const fetchStats = async () => {
    try { const r = await axios.get('/api/admin/stats'); setStats(r.data); } catch(e){}
  };
  const fetchAnalytics = async () => {
    try { const r = await axios.get('/api/analytics'); setAnalyticsData(r.data); } catch(e){}
  };
  const fetchProducts = async () => {
    if (products.length === 0) setLoading(true);
    try { const r = await axios.get('/api/products?limit=50'); setProducts(r.data.products || []); } catch(e){}
    setLoading(false);
  };
  const fetchOrders = async () => {
    if (orders.length === 0) setLoading(true);
    try { const r = await axios.get('/api/admin/orders'); setOrders(r.data); } catch(e){}
    setLoading(false);
  };
  const fetchUsers = async () => {
    if (users.length === 0) setLoading(true);
    try { const r = await axios.get('/api/admin/users'); setUsers(r.data); } catch(e){}
    setLoading(false);
  };
  const fetchCoupons = async () => {
    if (coupons.length === 0) setLoading(true);
    try { const r = await axios.get('/api/admin/coupons'); setCoupons(r.data); } catch(e){}
    setLoading(false);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...productForm, images: productForm.images.split(',').map(s => s.trim()).filter(Boolean) };
      if (editingProduct) {
        await axios.put(`/api/admin/products/${editingProduct._id}`, payload);
        showToast('Product updated.');
      } else {
        await axios.post('/api/admin/products', payload);
        showToast('Product created.');
      }
      setProductModal(false); setEditingProduct(null);
      setProductForm({ name:'', price:'', description:'', category:'', brand:'', stock:'', isFeatured: false, images: '' });
      fetchProducts();
    } catch(e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await axios.delete(`/api/admin/products/${id}`); fetchProducts(); showToast('Deleted.'); } catch(e) { showToast('Failed.', 'error'); }
  };

  const handleOrderStatus = async (orderId, status) => {
    try { await axios.put(`/api/admin/orders/${orderId}/status`, { status }); fetchOrders(); showToast('Order status updated.'); } catch(e) { showToast('Failed.', 'error'); }
  };

  const handleUserRole = async (id, role) => {
    try { await axios.put(`/api/admin/users/${id}/role`, { role }); fetchUsers(); showToast('Role updated.'); } catch(e) { showToast('Failed.', 'error'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`/api/admin/users/${id}`);
      setUsers(prevUsers => prevUsers.filter(u => (u._id || u.id) !== id));
      showToast('User deleted successfully', 'success');
    } catch(e) {
      showToast(e.response?.data?.message || 'Failed to delete user.', 'error');
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/admin/coupons', couponForm);
      showToast('Coupon created.');
      setCouponModal(false);
      setCouponForm({ code:'', discountType:'percentage', discountValue:'', minPurchase:'0', expiryDate:'', usageLimit:'100' });
      fetchCoupons();
    } catch(e) { showToast(e.response?.data?.message || 'Failed.', 'error'); }
  };

  const handleDeleteCoupon = async (id) => {
    try { await axios.delete(`/api/admin/coupons/${id}`); fetchCoupons(); showToast('Coupon deleted.'); } catch(e) {}
  };

  const inputCls = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500";
  const statCard = (label, value, icon, color) => (
    <div className={`glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-semibold">{label}</p>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{value ?? '—'}</p>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-900/90 text-white rounded-3xl my-6 border border-slate-800 shadow-2xl">
        <div className="max-w-md w-full bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Enterprise Admin Gateway</h1>
            <p className="text-xs text-slate-400 mt-1">Restricted Area — Enter your administrator credentials below to log in.</p>
          </div>

          {adminLoginError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{adminLoginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter your admin email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your admin password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={adminLoginLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {adminLoginLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Admin Console'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400">Default Administrator Credentials:</p>
            <div className="mt-2 text-xs font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-700 text-slate-300 flex items-center justify-between">
              <span>admin@devstore.com / Admin123!</span>
              <button
                onClick={handleFillCredentials}
                type="button"
                className="text-[10px] text-blue-400 hover:text-blue-300 font-sans font-bold bg-blue-500/10 px-2 py-1 rounded"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <aside className="w-full md:w-52 flex-shrink-0 space-y-2">
          <div className="glass p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 mb-4 text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">Admin Panel</span>
          </div>
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-0 cursor-pointer ${activeTab === tab.key ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-transparent'}`}>
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Users className="h-4 w-4" />
            <span>My Profile</span>
          </Link>
        </aside>

        {/* Content */}
        <main className="flex-1 space-y-6">

          {/* ─ Dashboard Stats ─ */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                {statCard('Total Revenue', stats ? `$${stats.grossRevenue?.toFixed(0)}` : '—', <TrendingUp className="h-6 w-6 text-green-600" />, 'bg-green-100 dark:bg-green-900/30')}
                {statCard('Total Orders', stats?.ordersCount, <ShoppingBag className="h-6 w-6 text-blue-600" />, 'bg-blue-100 dark:bg-blue-900/30')}
                {statCard('Total Products', stats?.productsCount, <Package className="h-6 w-6 text-indigo-600" />, 'bg-indigo-100 dark:bg-indigo-900/30')}
                {statCard('Customers', stats?.customersCount, <Users className="h-6 w-6 text-purple-600" />, 'bg-purple-100 dark:bg-purple-900/30')}
              </div>

              {stats?.lowStockAlerts > 0 && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-xs font-bold">{stats.lowStockAlerts} product(s) have stock ≤ 10 units. Restock soon!</p>
                </div>
              )}

              {/* Revenue Chart */}
              {analyticsData?.revenueRecords?.length > 0 && (
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 space-y-4">
                  <h3 className="font-extrabold text-slate-800 dark:text-white">Revenue (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analyticsData.revenueRecords} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="gross" name="Revenue ($)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="orders" name="Orders" fill="#818cf8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Products Table */}
              {stats?.topProducts?.length > 0 && (
                <div className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
                  <h3 className="font-extrabold text-slate-800 dark:text-white mb-4">Top Selling Products</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-slate-600 dark:text-slate-400">
                      <thead><tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="py-2 text-left font-bold text-slate-400 uppercase text-[10px]">Product</th>
                        <th className="py-2 text-right font-bold text-slate-400 uppercase text-[10px]">Units Sold</th>
                        <th className="py-2 text-right font-bold text-slate-400 uppercase text-[10px]">Revenue</th>
                      </tr></thead>
                      <tbody>{stats.topProducts.map((p, i) => (
                        <tr key={i} className="border-b border-slate-50 dark:border-slate-900">
                          <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{p.name}</td>
                          <td className="py-3 text-right">{p.quantity}</td>
                          <td className="py-3 text-right font-bold text-green-600">${p.revenue?.toFixed(2)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─ Products ─ */}
          {activeTab === 'products' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Products ({products.length})</h2>
                <button onClick={() => { setEditingProduct(null); setProductForm({ name:'', price:'', description:'', category:'', brand:'', stock:'', isFeatured: false, images: '' }); setProductModal(true); }}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-2 cursor-pointer">
                  <Plus className="h-4 w-4" /> Add Product
                </button>
              </div>
              {loading ? <div className="h-64 skeleton rounded-3xl"></div> : (
                <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <tr>{['Product','Category','Price','Stock','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {products.map(prod => (
                        <tr key={prod._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={prod.images?.[0]} className="w-9 h-9 rounded-xl object-cover" alt="" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">{prod.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{prod.category}</td>
                          <td className="px-4 py-3 font-bold text-blue-600">${prod.price}</td>
                          <td className="px-4 py-3">
                            <span className={`font-bold ${prod.stock <= 10 ? 'text-red-500' : 'text-green-500'}`}>{prod.stock}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingProduct(prod); setProductForm({ name: prod.name, price: prod.price, description: prod.description, category: prod.category, brand: prod.brand, stock: prod.stock, isFeatured: prod.isFeatured, images: (prod.images||[]).join(', ') }); setProductModal(true); }}
                                className="text-blue-500 hover:text-blue-700 p-1 border-0 bg-transparent cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDeleteProduct(prod._id)} className="text-red-500 hover:text-red-700 p-1 border-0 bg-transparent cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─ Orders ─ */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">All Orders ({orders.length})</h2>
              {loading ? <div className="h-64 skeleton rounded-3xl"></div> : (
                <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden overflow-x-auto">
                  <table className="w-full text-xs min-w-[640px]">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <tr>{['Order ID','Customer','Total','Payment','Status','Update'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {orders.map(order => (
                        <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{order.orderId}</td>
                          <td className="px-4 py-3 text-slate-500">{order.userId?.substring(0,8)}…</td>
                          <td className="px-4 py-3 font-bold text-green-600">${order.prices?.grandTotal}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] px-2 py-1 rounded font-extrabold uppercase ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{order.paymentStatus}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[9px] px-2 py-1 rounded font-extrabold uppercase ${order.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-700' : order.deliveryStatus === 'shipped' ? 'bg-blue-100 text-blue-700' : order.deliveryStatus === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{order.deliveryStatus}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select onChange={e => handleOrderStatus(order.orderId, e.target.value)} defaultValue={order.deliveryStatus}
                              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[10px] cursor-pointer">
                              {['processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─ Users ─ */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Registered Users ({users.length})</h2>
              {loading ? <div className="h-64 skeleton rounded-3xl"></div> : (
                <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <tr>{['Name','Email','Role','Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {users.map(u => {
                        const userId = u._id || u.id;
                        const isProtected = u.role === 'admin' || u.email === 'admin@devstore.com';

                        return (
                          <tr key={userId || u.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{u.name || u.username || 'User'}</td>
                            <td className="px-4 py-3 text-slate-500">{u.email}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[9px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{u.role}</span>
                            </td>
                            <td className="px-4 py-3">
                              {isProtected ? (
                                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 w-fit">
                                  🔒 PROTECTED
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleDeleteUser(userId)}
                                  className="px-3 py-1 text-xs font-semibold rounded-md bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all duration-200 cursor-pointer"
                                >
                                  Delete User
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ─ Coupons ─ */}
          {activeTab === 'coupons' && (
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Coupons ({coupons.length})</h2>
                <button onClick={() => setCouponModal(true)} className="btn-primary py-2 px-4 text-xs flex items-center gap-2 cursor-pointer">
                  <Plus className="h-4 w-4" /> New Coupon
                </button>
              </div>
              {loading ? <div className="h-40 skeleton rounded-3xl"></div> : (
                <div className="glass rounded-3xl border border-slate-200/50 dark:border-slate-800/80 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                      <tr>{['Code','Type','Value','Min Purchase','Expiry','Used','Delete'].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 uppercase">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                      {coupons.map(c => (
                        <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                          <td className="px-4 py-3 font-extrabold text-blue-600">{c.code}</td>
                          <td className="px-4 py-3 text-slate-500">{c.discountType}</td>
                          <td className="px-4 py-3 font-bold text-green-600">{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                          <td className="px-4 py-3 text-slate-500">${c.minPurchase}</td>
                          <td className="px-4 py-3 text-slate-500">{new Date(c.expiryDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-slate-500">{c.usageCount}/{c.usageLimit}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDeleteCoupon(c._id)} className="text-red-500 hover:text-red-700 border-0 bg-transparent p-1 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Product Modal */}
      {productModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-2xl w-full rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-950 space-y-5 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setProductModal(false)} className="text-slate-400 hover:text-slate-700 border-0 bg-transparent cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="grid grid-cols-2 gap-4">
              {[['name','Product Name',2],['price','Price ($)',1],['stock','Stock',1],['brand','Brand',1],['category','Category',1]].map(([f,l,span]) => (
                <div key={f} className={`space-y-1 ${span === 2 ? 'col-span-2' : ''}`}>
                  <label className="text-[11px] font-bold text-slate-450 block">{l}</label>
                  <input value={productForm[f]} onChange={e => setProductForm({...productForm, [f]: e.target.value})} className={`w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none`} required />
                </div>
              ))}
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-450 block">Description</label>
                <textarea rows="3" value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-450 block">Image URLs (comma-separated)</label>
                <input value={productForm.images} onChange={e => setProductForm({...productForm, images: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:outline-none" placeholder="https://..." />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="featuredCheck" checked={productForm.isFeatured} onChange={e => setProductForm({...productForm, isFeatured: e.target.checked})} className="accent-blue-500" />
                <label htmlFor="featuredCheck" className="text-xs text-slate-600 dark:text-slate-400">Mark as Featured Product</label>
              </div>
              <div className="col-span-2 flex gap-4">
                <button type="button" onClick={() => setProductModal(false)} className="btn-secondary flex-1 py-2.5 text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer">
                  <Save className="h-3.5 w-3.5" /> {editingProduct ? 'Update' : 'Create'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {couponModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-md w-full rounded-3xl p-8 border border-slate-200/50 dark:border-slate-800/80 bg-white dark:bg-slate-950 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-slate-900 dark:text-white">Create Coupon</h3>
              <button onClick={() => setCouponModal(false)} className="text-slate-400 border-0 bg-transparent cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {[['code','Coupon Code (e.g. SAVE20)'],['discountValue','Discount Value'],['minPurchase','Min Purchase ($)'],['usageLimit','Usage Limit'],['expiryDate','Expiry Date']].map(([f,l]) => (
                <div key={f} className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-450 block">{l}</label>
                  <input type={f === 'expiryDate' ? 'date' : 'text'} value={couponForm[f]} onChange={e => setCouponForm({...couponForm, [f]: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:outline-none" required />
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-450 block">Discount Type</label>
                <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs dark:text-white focus:outline-none cursor-pointer">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="button" onClick={() => setCouponModal(false)} className="btn-secondary flex-1 py-2.5 text-xs cursor-pointer">Cancel</button>
                <button type="submit" className="btn-primary flex-1 py-2.5 text-xs cursor-pointer">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
