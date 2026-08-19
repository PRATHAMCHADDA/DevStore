import { Product, Category, Brand, Review, Analytics } from '../models/index.js';

export const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 8
    } = req.query;

    const filter = {};

    // 1. Text Search
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
      
      // Store search query in SQL Analytics for search ranking
      try {
        await Analytics.create({
          eventType: 'search',
          meta: JSON.stringify({ query: search }),
          userId: req.user ? req.user.id : null
        });
      } catch (err) {
        console.error('Analytics log search error:', err.message);
      }
    }

    // 2. Category Filter
    if (category) {
      filter.category = category;
    }

    // 3. Brand Filter
    if (brand) {
      filter.brand = brand;
    }

    // 4. Price range Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // 5. Rating Filter
    if (rating) {
      filter.ratings = { $gte: parseFloat(rating) };
    }

    // Query DB - use chain without await since chain.then resolves to array
    const findChain = Product.find(filter);
    
    // Sort
    let sortKey = 'createdAt';
    let sortDir = -1;
    if (sort === 'priceAsc') { sortKey = 'price'; sortDir = 1; }
    else if (sort === 'priceDesc') { sortKey = 'price'; sortDir = -1; }
    else if (sort === 'rating') { sortKey = 'ratings'; sortDir = -1; }

    const sortObj = { [sortKey]: sortDir };

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skipNum = (pageNum - 1) * limitNum;

    // Use the chain's built-in sort/skip/limit/exec
    const resolvedChain = await findChain;
    const totalProducts = Array.isArray(resolvedChain) ? resolvedChain.length : 
      (resolvedChain.data ? resolvedChain.data.length : 0);

    // Sort, skip, limit the resolved array manually
    const allResults = Array.isArray(resolvedChain) ? resolvedChain : 
      (resolvedChain.data || []);

    const sortedResults = [...allResults].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDir === 1 ? -1 : 1;
      if (valA > valB) return sortDir === 1 ? 1 : -1;
      return 0;
    });

    const products = sortedResults.slice(skipNum, skipNum + limitNum);
    const pages = Math.ceil(totalProducts / limitNum);

    res.status(200).json({
      products,
      page: pageNum,
      pages,
      totalProducts
    });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const featured = await Product.find({ isFeatured: true });
    res.status(200).json(featured.slice(0, 4));
  } catch (error) {
    next(error);
  }
};

export const getTrendingProducts = async (req, res, next) => {
  try {
    const trending = await Product.find({ isTrending: true });
    res.status(200).json(trending.slice(0, 4));
  } catch (error) {
    next(error);
  }
};

export const getTodayDeals = async (req, res, next) => {
  try {
    const deals = await Product.find({ isTodayDeal: true });
    res.status(200).json(deals.slice(0, 4));
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Load related reviews
    const reviews = await Review.find({ productId: product._id.toString() });

    // Track analytics event: view_item
    try {
      await Analytics.create({
        eventType: 'view_item',
        productId: product._id.toString(),
        userId: req.user ? req.user.id : null
      });
    } catch (err) {
      console.error('Analytics log view error:', err.message);
    }

    res.status(200).json({
      product,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find();
    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { category, productId } = req.query;
    
    // Find products in same category, exclude current
    const related = await Product.find({
      category,
      _id: { $ne: productId }
    });

    res.status(200).json(related.slice(0, 4));
  } catch (error) {
    next(error);
  }
};

export const getAutocompleteSuggestions = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.status(250).json([]);
    }

    const products = await Product.find({
      name: new RegExp(query, 'i')
    });

    const suggestions = products.slice(0, 5).map(p => ({
      name: p.name,
      slug: p.slug,
      category: p.category
    }));

    res.status(200).json(suggestions);
  } catch (error) {
    next(error);
  }
};

export const getAIRecommendations = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    let recommendedProducts = [];

    if (userId) {
      // Find recently viewed products in SQL Analytics
      const recentViews = await Analytics.findAll({
        where: { userId, eventType: 'view_item' },
        limit: 5,
        order: [['createdAt', 'DESC']]
      });

      if (recentViews && recentViews.length > 0) {
        const productIds = recentViews.map(rv => rv.productId).filter(Boolean);
        
        // Find categories of viewed products
        const viewedProducts = [];
        for (const pId of productIds) {
          const prod = await Product.findById(pId);
          if (prod) viewedProducts.push(prod);
        }

        const categories = [...new Set(viewedProducts.map(p => p.category))];

        if (categories.length > 0) {
          // Recommend other products in same categories
          const matching = await Product.find({
            category: { $in: categories },
            _id: { $nin: productIds }
          });
          recommendedProducts = matching.slice(0, 4);
        }
      }
    }

    // Fallback: If no recommendations found, return top rated products
    if (recommendedProducts.length === 0) {
      const topProductsQuery = await Product.find();
      const allProducts = Array.isArray(topProductsQuery) ? topProductsQuery : 
        (topProductsQuery.data || []);
      recommendedProducts = [...allProducts]
        .sort((a, b) => (b.ratings || 0) - (a.ratings || 0))
        .slice(0, 4);
    }

    res.status(200).json(recommendedProducts);
  } catch (error) {
    next(error);
  }
};
