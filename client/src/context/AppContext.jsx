import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Configure Axios & API Base URL Defaults
axios.defaults.withCredentials = true;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.MODE === 'production' ? '' : 'http://localhost:5000');
if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // --- Toast notifications states ---
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- Auth State ---
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- Theme State ---
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // --- Cart & Wishlist States ---
  const [cart, setCart] = useState({ items: [] });
  const [wishlist, setWishlist] = useState({ products: [] });
  const [cartLoading, setCartLoading] = useState(false);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Theme Sync effect ---
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- Authenticate User on boot ---
  const checkAuth = async () => {
    setAuthLoading(true);
    try {
      const res = await axios.get('/api/auth/me');
      const userData = res.data?.user || res.data;
      if (userData && (userData._id || userData.id || userData.email)) {
        setUser(userData);
        loadCart();
        loadWishlist();
      }
    } catch (err) {
      try {
        const res = await axios.get('/api/auth/profile');
        const userData = res.data?.user || res.data;
        if (userData && (userData._id || userData.id || userData.email)) {
          setUser(userData);
          loadCart();
          loadWishlist();
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // --- Axios Interceptors for Token Renewal ---
  useEffect(() => {
    // Routes that should NEVER trigger a refresh retry (to avoid infinite loops)
    const noRetryUrls = ['/api/auth/refresh', '/api/auth/profile', '/api/auth/me', '/api/auth/login', '/api/auth/logout'];

    let isRefreshing = false;
    let refreshSubscribers = [];

    const onRefreshed = () => {
      refreshSubscribers.forEach(cb => cb());
      refreshSubscribers = [];
    };

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Skip retry for auth/refresh endpoints to prevent infinite loops
        const isNoRetryUrl = noRetryUrls.some(url => originalRequest?.url?.includes(url));

        if (error.response && error.response.status === 401 && !originalRequest._retry && !isNoRetryUrl) {
          originalRequest._retry = true;

          if (!isRefreshing) {
            isRefreshing = true;
            try {
              await axios.post('/api/auth/refresh');
              onRefreshed();
              return axios(originalRequest);
            } catch (refreshError) {
              setUser(null);
              refreshSubscribers = [];
              return Promise.reject(refreshError);
            } finally {
              isRefreshing = false;
            }
          } else {
            // Queue the request until refresh completes
            return new Promise((resolve) => {
              refreshSubscribers.push(() => {
                resolve(axios(originalRequest));
              });
            });
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // --- Load Cart & Wishlist ---
  const loadCart = async () => {
    try {
      setCartLoading(true);
      const res = await axios.get('/api/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setCartLoading(false);
    }
  };

  const loadWishlist = async () => {
    try {
      const res = await axios.get('/api/wishlist');
      setWishlist(res.data);
    } catch (err) {
      console.error('Failed to load wishlist:', err.message);
    }
  };

  // --- Cart Operations ---
  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      showToast('Please sign in to add items to your cart.', 'error');
      return false;
    }
    try {
      setCartLoading(true);
      const res = await axios.post('/api/cart/add', { productId, quantity });
      setCart(res.data.cart);
      showToast(res.data.message || 'Added to cart!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add item to cart.', 'error');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const updateCartQty = async (productId, quantity) => {
    try {
      setCartLoading(true);
      const res = await axios.put('/api/cart/update', { productId, quantity });
      setCart(res.data.cart);
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update quantity.', 'error');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setCartLoading(true);
      const res = await axios.delete(`/api/cart/${productId}`);
      setCart(res.data.cart);
      showToast('Removed from cart.');
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove from cart.', 'error');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      const res = await axios.delete('/api/cart/clear');
      setCart(res.data.cart);
    } catch (err) {
      showToast('Failed to clear cart.', 'error');
    }
  };

  // --- Wishlist Operations ---
  const addToWishlist = async (productId) => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist.', 'error');
      return false;
    }
    try {
      const res = await axios.post('/api/wishlist/add', { productId });
      setWishlist(res.data.wishlist);
      showToast(res.data.message || 'Added to wishlist!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Item already in wishlist.', 'error');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const res = await axios.delete(`/api/wishlist/${productId}`);
      setWishlist(res.data.wishlist);
      showToast('Removed from wishlist.');
      return true;
    } catch (err) {
      showToast('Failed to remove from wishlist.', 'error');
      return false;
    }
  };

  // --- Login / Register Actions ---
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      const userData = res.data?.user || res.data;
      setUser(userData);
      showToast(res.data?.message || 'Welcome back!');
      // Load user cart and wishlist
      loadCart();
      loadWishlist();
      return { success: true, user: userData };
    } catch (err) {
      setUser(null);
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid email or password.'
      };
    }
  };

  const register = async (name, username, email, phone, password, confirmPassword) => {
    try {
      const res = await axios.post('/api/auth/register', { name, username, email, phone, password, confirmPassword });
      const userData = res.data?.user || res.data;
      showToast('Signed up successfully');
      return { success: true, user: userData };
    } catch (err) {
      const errors = err.response?.data?.errors;
      const errMsg = errors ? errors.map(e => e.msg).join(' ') : (err.response?.data?.message || 'Registration failed.');
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setCart({ items: [] });
      setWishlist({ products: [] });
      showToast('Signed out successfully.');
    } catch (err) {
      showToast('Error during sign out.', 'error');
    }
  };

  // --- Totals Computations ---
  const cartSubtotal = (cart?.items || []).reduce((sum, item) => sum + ((item?.discountedPrice ?? item?.price ?? 0) * (item?.quantity || 1)), 0);
  const cartTotalQty = (cart?.items || []).reduce((sum, item) => sum + (item?.quantity || 0), 0);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      authLoading,
      checkAuth,
      login,
      register,
      logout,
      toast,
      showToast,
      darkMode,
      toggleDarkMode,
      cart,
      wishlist,
      cartLoading,
      cartSubtotal,
      cartTotalQty,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      addToWishlist,
      removeFromWishlist,
      searchQuery,
      setSearchQuery
    }}>
      {children}
      
      {/* Toast Alert Component */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] px-6 py-4 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 text-white font-medium flex items-center gap-3 animate-bounce ${
          toast.type === 'error' ? 'bg-red-500 shadow-red-500/20' : 'bg-green-500 shadow-green-500/20'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
