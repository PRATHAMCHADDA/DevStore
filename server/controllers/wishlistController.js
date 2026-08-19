import { Wishlist, Product } from '../models/index.js';

// Helper to expand product details inside wishlist
const expandWishlistProducts = async (wishlist) => {
  if (!wishlist) return { products: [] };
  const products = [];
  for (const prodId of (wishlist.products || [])) {
    const product = await Product.findById(prodId);
    if (product) {
      products.push(product);
    }
  }
  return { _id: wishlist._id, userId: wishlist.userId, products };
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    const expanded = await expandWishlistProducts(wishlist);
    res.status(200).json(expanded);
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    const products = [...(wishlist.products || [])];
    if (products.includes(productId)) {
      return res.status(400).json({ message: 'Product is already in your wishlist.' });
    }

    products.push(productId);

    const updated = await Wishlist.findByIdAndUpdate(
      wishlist._id,
      { $set: { products } },
      { new: true }
    );

    const expanded = await expandWishlistProducts(updated);
    res.status(200).json({ message: 'Added to wishlist.', wishlist: expanded });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    let products = [...(wishlist.products || [])];
    products = products.filter(id => id !== productId);

    const updated = await Wishlist.findByIdAndUpdate(
      wishlist._id,
      { $set: { products } },
      { new: true }
    );

    const expanded = await expandWishlistProducts(updated);
    res.status(200).json({ message: 'Removed from wishlist.', wishlist: expanded });
  } catch (error) {
    next(error);
  }
};
