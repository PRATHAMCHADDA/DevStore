import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getTrendingProducts,
  getTodayDeals,
  getProductBySlug,
  getCategories,
  getBrands,
  getRelatedProducts,
  getAutocompleteSuggestions,
  getAIRecommendations
} from '../controllers/productController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/trending', getTrendingProducts);
router.get('/deals', getTodayDeals);
router.get('/categories', getCategories);
router.get('/brands', getBrands);
router.get('/related', getRelatedProducts);
router.get('/autocomplete', getAutocompleteSuggestions);
router.get('/recommendations', optionalAuth, getAIRecommendations);
router.get('/:slug', getProductBySlug);

export default router;
