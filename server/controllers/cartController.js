import { Cart, Product } from '../models/index.js';

// Helper to expand product details inside cart items
const expandCartItems = async (cart) => {
  if (!cart) return { items: [] };
  const items = [];
  for (const item of (cart.items || [])) {
    const product = await Product.findById(item.productId);
    if (product) {
      items.push({
        productId: item.productId,
        quantity: item.quantity,
        name: product.name,
        slug: product.slug,
        price: product.price,
        discountedPrice: product.discountedPrice || product.price,
        image: product.images[0] || '',
        stock: product.stock
      });
    }
  }
  return { _id: cart._id, userId: cart.userId, items };
};

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const expandedCart = await expandCartItems(cart);
    res.status(200).json(expandedCart);
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Check product stock first
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const items = [...(cart.items || [])];
    const existingIndex = items.findIndex(item => item.productId === productId);

    if (existingIndex > -1) {
      // Check stock limit
      const newQty = items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
      }
      items[existingIndex].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
      }
      items.push({ productId, quantity });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      { $set: { items } },
      { new: true }
    );

    const expandedCart = await expandCartItems(updatedCart);
    res.status(200).json({ message: 'Added to cart successfully.', cart: expandedCart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items left.` });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const items = [...(cart.items || [])];
    const itemIndex = items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      items[itemIndex].quantity = quantity;
    } else {
      return res.status(404).json({ message: 'Product not in cart.' });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      { $set: { items } },
      { new: true }
    );

    const expandedCart = await expandCartItems(updatedCart);
    res.status(200).json({ message: 'Cart quantity updated.', cart: expandedCart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    let items = [...(cart.items || [])];
    items = items.filter(item => item.productId !== productId);

    const updatedCart = await Cart.findByIdAndUpdate(
      cart._id,
      { $set: { items } },
      { new: true }
    );

    const expandedCart = await expandCartItems(updatedCart);
    res.status(200).json({ message: 'Removed from cart.', cart: expandedCart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId });
    if (cart) {
      await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });
    }
    res.status(200).json({ message: 'Cart cleared.', cart: { items: [] } });
  } catch (error) {
    next(error);
  }
};
