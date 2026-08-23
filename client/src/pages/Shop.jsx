import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Filter, SlidersHorizontal, Search, Star, ShoppingBag, Eye, X, Heart } from 'lucide-react';
import axios from 'axios';

export const Shop = () => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Catalog State
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters State (Sync from Query params or defaults)
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [selCategory, setSelCategory] = useState(searchParams.get('category') || '');
  const [selBrand, setSelBrand] = useState(searchParams.get('brand') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || 4000);
  const [minRating, setMinRating] = useState(searchParams.get('rating') || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');

  // Categories & Brands lists
  const [categoriesList, setCategoriesList] = useState([]);
  const [brandsList, setBrandsList] = useState([]);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Fetch list of Categories and Brands once
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          axios.get('/api/products/categories'),
          axios.get('/api/products/brands')
        ]);
        setCategoriesList(catRes.data);
        setBrandsList(brandRes.data);
      } catch (err) {
        console.error('Failed to load filter parameters:', err.message);
      }
    };
    fetchMetadata();
  }, []);

  // Sync state when URL query parameters change (e.g. from Footer links)
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat !== null && cat !== undefined) {
      if (!cat) {
        setSelCategory('');
      } else if (categoriesList.length > 0) {
        const match = categoriesList.find(c => c.name.toLowerCase() === cat.toLowerCase() || c.slug.toLowerCase() === cat.toLowerCase());
        setSelCategory(match ? match.name : cat);
      } else {
        setSelCategory(cat);
      }
    }
  }, [searchParams, categoriesList]);

  // Fetch catalog products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryObj = {
        page: activePage,
        limit: 6,
        sort: sortBy
      };

      if (searchVal) queryObj.search = searchVal;
      if (selCategory) queryObj.category = selCategory;
      if (selBrand) queryObj.brand = selBrand;
      if (maxPrice) queryObj.maxPrice = maxPrice;
      if (minRating) queryObj.rating = minRating;

      const queryString = new URLSearchParams(queryObj).toString();
      const res = await axios.get(`/api/products?${queryString}`);

      setProducts(res.data.products);
      setPages(res.data.pages);
      
      // Sync URL params
      setSearchParams(queryObj);
    } catch (err) {
      console.error('Catalog fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activePage, selCategory, selBrand, maxPrice, minRating, sortBy]);

  // Handle Search Execution
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActivePage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearchVal('');
    setSelCategory('');
    setSelBrand('');
    setMaxPrice(4000);
    setMinRating(0);
    setSortBy('newest');
    setActivePage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex flex-col md:flex-row gap-10 items-start">
        
        {/* === FILTER SIDEBAR === */}
        <aside className="filter-sidebar w-full md:w-64 flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto space-y-8 glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/80">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Filter className="h-4.5 w-4.5 text-blue-500" />
              <span>Filters</span>
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-blue-500 hover:underline border-0 bg-transparent cursor-pointer font-medium"
            >
              Reset All
            </button>
          </div>

          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input 
              type="text" 
              placeholder="Search store..." 
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none dark:text-white"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          </form>

          {/* Categories Selector */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Categories</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setSelCategory(''); setActivePage(1); }}
                className={`text-left text-xs py-1.5 px-3 rounded-lg border-0 cursor-pointer ${!selCategory ? 'bg-blue-500 text-white font-semibold' : 'text-slate-650 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-900 bg-transparent'}`}
              >
                All Categories
              </button>
              {categoriesList.map(cat => (
                <button
                  key={cat._id}
                  onClick={() => { setSelCategory(cat.name); setActivePage(1); }}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg border-0 cursor-pointer ${selCategory === cat.name ? 'bg-blue-500 text-white font-semibold' : 'text-slate-650 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-900 bg-transparent'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Selector */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Brands</h4>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => { setSelBrand(''); setActivePage(1); }}
                className={`text-left text-xs py-1.5 px-3 rounded-lg border-0 cursor-pointer ${!selBrand ? 'bg-blue-500 text-white font-semibold' : 'text-slate-650 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-900 bg-transparent'}`}
              >
                All Brands
              </button>
              {brandsList.map(br => (
                <button
                  key={br._id}
                  onClick={() => { setSelBrand(br.name); setActivePage(1); }}
                  className={`text-left text-xs py-1.5 px-3 rounded-lg border-0 cursor-pointer ${selBrand === br.name ? 'bg-blue-500 text-white font-semibold' : 'text-slate-650 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:bg-slate-900 bg-transparent'}`}
                >
                  {br.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <h4 className="font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Max Price</h4>
              <span className="font-bold text-blue-500">${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="4000" 
              step="50"
              value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setActivePage(1); }}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Rating filter */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">Minimum Rating</h4>
            <div className="flex gap-1.5">
              {[0, 3, 4, 4.5].map(stars => (
                <button
                  key={stars}
                  onClick={() => { setMinRating(stars); setActivePage(1); }}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer ${minRating == stars ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 text-slate-700 bg-transparent dark:border-slate-800 dark:text-slate-450'}`}
                >
                  {stars === 0 ? 'All' : `${stars}★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* === MAIN CATALOG WRAPPER === */}
        <main className="flex-1 space-y-8">
          
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-205 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Products Catalog</h1>
              <p className="text-xs text-slate-400">Showing all premium developer products</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setActivePage(1); }}
                className="px-3 py-1.5 bg-slate-100/50 border border-slate-200 rounded-xl text-xs dark:bg-slate-900 dark:border-slate-850 focus:outline-none dark:text-slate-200"
              >
                <option value="newest">Newest Arrival</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Grid Products List */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-80 skeleton rounded-2xl"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass py-24 text-center rounded-3xl space-y-4">
              <SlidersHorizontal className="h-12 w-12 text-slate-350 mx-auto" />
              <h3 className="text-lg font-bold text-slate-700 dark:text-white">No products found matching filters.</h3>
              <button onClick={handleResetFilters} className="btn-primary text-xs py-2 px-4 rounded-xl">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products.map(prod => {
                const activePrice = prod.discountedPrice || prod.price;
                return (
                  <div key={prod._id} className="glass rounded-3xl overflow-hidden group hover:scale-[1.02] transition-all flex flex-col border border-slate-250/20 dark:border-slate-805/30">
                    <Link to={`/product/${prod.slug}`} className="relative h-48 overflow-hidden block">
                      <img 
                        src={prod.images[0]} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.discountedPrice && prod.discountedPrice < prod.price && (
                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                          SALE
                        </span>
                      )}
                    </Link>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] text-blue-500 font-bold uppercase">{prod.category}</span>
                          <div className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                            <Star className="h-3 w-3 fill-amber-500" />
                            <span>{prod.ratings || 0}</span>
                          </div>
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 mt-1 font-sans">
                          <Link to={`/product/${prod.slug}`} className="hover:underline">{prod.name}</Link>
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prod.description}</p>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div>
                          <span className="text-md font-extrabold text-slate-900 dark:text-white">${activePrice}</span>
                          {prod.discountedPrice && (
                            <span className="text-xs line-through text-slate-400 ml-1.5">${prod.price}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setQuickViewProduct(prod)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border-0 cursor-pointer"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(() => {
                            const isWishlisted = (wishlist?.products || []).some(p => p._id === prod._id);
                            return (
                              <button 
                                onClick={() => isWishlisted ? removeFromWishlist(prod._id) : addToWishlist(prod._id)}
                                className={`p-2 rounded-xl transition-all border-0 cursor-pointer ${
                                  isWishlisted
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-400'
                                }`}
                                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              >
                                <Heart className={`h-4 w-4 transition-all ${isWishlisted ? 'fill-red-500' : ''}`} />
                              </button>
                            );
                          })()}
                          <button 
                            onClick={() => addToCart(prod._id, 1)}
                            className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border-0 cursor-pointer"
                          >
                            <ShoppingBag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controllers */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button 
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                disabled={activePage === 1}
                className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              {Array.from({ length: pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePage(i + 1)}
                  className={`w-9 h-9 rounded-xl border text-xs font-bold flex items-center justify-center cursor-pointer ${activePage === i + 1 ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 text-slate-700 bg-transparent dark:border-slate-800 dark:text-slate-400'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                onClick={() => setActivePage(p => Math.min(pages, p + 1))}
                disabled={activePage === pages}
                className="px-4 py-2 border rounded-xl text-xs hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}

        </main>
      </div>

      {/* === QUICK VIEW OVERLAY MODAL === */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="glass max-w-2xl w-full rounded-3xl overflow-hidden relative border border-slate-200/50 dark:border-slate-800/80 p-8 shadow-2xl flex flex-col md:flex-row gap-8 bg-white dark:bg-slate-950">
            <button 
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-450 border-0 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="w-full md:w-1/2 aspect-video md:aspect-square rounded-2xl overflow-hidden">
              <img src={quickViewProduct.images[0]} alt={quickViewProduct.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] text-blue-500 font-extrabold uppercase">{quickViewProduct.category}</span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1 leading-tight">{quickViewProduct.name}</h2>
                <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
                  <span>Brand: <strong>{quickViewProduct.brand}</strong></span>
                  <span>|</span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span>{quickViewProduct.ratings} ({quickViewProduct.reviewsCount} reviews)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-3 leading-relaxed">{quickViewProduct.description}</p>
                <div className="mt-3">
                  <span className={`text-[10px] px-2 py-1 rounded font-bold ${quickViewProduct.stock > 0 ? 'bg-green-100 dark:bg-green-950/20 text-green-600' : 'bg-red-100 dark:bg-red-950/20 text-red-600'}`}>
                    {quickViewProduct.stock > 0 ? `In Stock (${quickViewProduct.stock})` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div>
                <div className="pb-4 border-t border-slate-100 dark:border-slate-850 pt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    ${quickViewProduct.discountedPrice || quickViewProduct.price}
                  </span>
                  {quickViewProduct.discountedPrice && (
                    <span className="text-sm line-through text-slate-450">
                      ${quickViewProduct.price}
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {(() => {
                    const isWishlisted = (wishlist?.products || []).some(p => p._id === quickViewProduct._id);
                    return (
                      <button 
                        onClick={() => { isWishlisted ? removeFromWishlist(quickViewProduct._id) : addToWishlist(quickViewProduct._id); setQuickViewProduct(null); }}
                        className={`!py-2.5 text-center text-xs flex justify-center items-center gap-1.5 cursor-pointer rounded-xl border font-semibold transition-all ${
                          isWishlisted
                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:border-red-800'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-dark-card dark:border-dark-border dark:text-dark-text dark:hover:bg-slate-800'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                        {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                      </button>
                    );
                  })()}
                  <button 
                    disabled={quickViewProduct.stock === 0}
                    onClick={() => { addToCart(quickViewProduct._id, 1); setQuickViewProduct(null); }}
                    className="btn-primary !py-2.5 text-center text-xs flex justify-center cursor-pointer disabled:opacity-50"
                  >
                    Add Bag
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
