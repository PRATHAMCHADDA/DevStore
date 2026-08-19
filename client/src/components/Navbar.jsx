import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, Sun, Moon, ShoppingBag, Heart, User, 
  Menu, X, LogOut, LayoutDashboard, Settings, Compass 
} from 'lucide-react';
import axios from 'axios';

export const Navbar = () => {
  const { 
    user, logout, darkMode, toggleDarkMode, 
    cartTotalQty, wishlist, searchQuery, setSearchQuery 
  } = useApp();
  
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // Autocomplete suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await axios.get(`/api/products/autocomplete?query=${searchQuery}`);
        setSuggestions(res.data);
      } catch (err) {
        setSuggestions([]);
      }
    };

    const timerObj = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timerObj);
  }, [searchQuery]);

  // Close search suggestions on click outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
  };

  const selectSuggestion = (slug) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/product/${slug}`);
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const wishlistCount = wishlist?.products?.length || 0;

  return (
    <nav className="sticky top-0 z-[100] w-full glass-nav transition-all border-b border-slate-200/50 dark:border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              DevStore
            </span>
          </Link>

          {/* Autocomplete Search Bar */}
          <form 
            ref={searchRef} 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex relative flex-1 max-w-md mx-4"
          >
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search premium products..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border focus:ring-1 focus:ring-blue-500 bg-slate-100/50 focus:bg-white border-slate-200 focus:outline-none dark:border-slate-800 dark:bg-slate-900/50 dark:focus:bg-slate-900 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            </div>

            {/* Recommendations Autocomplete list */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-11 left-0 w-full glass dark:bg-slate-950/95 border border-slate-200/50 dark:border-slate-800/80 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectSuggestion(item.slug)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-100/50 dark:hover:bg-slate-900 flex flex-col transition-colors"
                  >
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-250 truncate">{item.name}</span>
                    <span className="text-xs text-slate-400">{item.category}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Action Tabs */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/shop" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-850 transition-all">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Compass className="h-5 w-5" />
                <span>Shop</span>
              </div>
            </Link>

            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-850 transition-all"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Wishlist Indicator */}
            <Link 
              to="/dashboard?tab=wishlist" 
              className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-850 transition-all"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white min-w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full px-1 shadow-md animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Indicator */}
            <Link 
              to="/cart" 
              className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white p-2.5 rounded-xl hover:bg-slate-100/50 dark:hover:bg-slate-850 transition-all font-medium"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartTotalQty > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white min-w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full px-1 shadow-md">
                  {cartTotalQty}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-850 transition-all text-slate-700 dark:text-slate-300 font-semibold"
                >
                  <User className="h-4.5 w-4.5" />
                  <span className="text-sm max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass dark:bg-slate-950/95 border border-slate-200/50 dark:border-slate-800/80 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                    {user.role === 'admin' ? (
                      <Link 
                        to="/admin" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Admin Panel</span>
                      </Link>
                    ) : null}
                    
                    <Link 
                      to="/dashboard" 
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-900"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>

                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left border-t border-slate-100 dark:border-slate-800"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary py-2 text-sm !rounded-xl">
                Sign In
              </Link>
            )}

          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={toggleDarkMode}
              className="text-slate-600 hover:text-slate-950 dark:text-slate-350 dark:hover:text-white p-2 rounded-xl"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link to="/cart" className="relative p-2 text-slate-600 dark:text-slate-350">
              <ShoppingBag className="h-5 w-5" />
              {cartTotalQty > 0 && (
                <span className="absolute top-0 right-0 bg-blue-500 text-white min-w-4 h-4 flex items-center justify-center text-[9px] font-bold rounded-full px-0.5">
                  {cartTotalQty}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-350"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Options */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-slate-200 dark:border-slate-800/80 px-4 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-250 dark:border-slate-800 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          </form>

          <div className="flex flex-col gap-2 font-medium">
            <Link 
              to="/shop" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-900"
            >
              <Compass className="h-5 w-5" />
              <span>Explore Shop</span>
            </Link>

            <Link 
              to="/dashboard?tab=wishlist" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-700 dark:text-slate-350 hover:bg-slate-100/50 dark:hover:bg-slate-900"
            >
              <Heart className="h-5 w-5" />
              <span>My Wishlist ({wishlistCount})</span>
            </Link>

            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-xl text-slate-770 hover:bg-slate-100/50 dark:hover:bg-slate-900 dark:text-slate-350"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Admin Controls</span>
                  </Link>
                )}
                
                <Link 
                  to="/dashboard" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 p-2 rounded-xl text-slate-770 hover:bg-slate-100/50 dark:hover:bg-slate-900 dark:text-slate-350"
                >
                  <User className="h-5 w-5" />
                  <span>My Profile Dashboard</span>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 rounded-xl text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full btn-primary text-center py-2"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
