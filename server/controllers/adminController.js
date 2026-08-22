import { Product, Order, User, Category, Brand, Coupon, Review, Payment } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core aggregates
    const productsCount = await Product.countDocuments();
    const ordersCount = await Order.countDocuments();
    const customersCount = await User.countDocuments({ role: 'customer' });

    // 2. Compute sales totals from paid orders
    const orders = await Order.find();
    const grossRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.prices.grandTotal, 0);

    const pendingOrders = orders.filter(o => o.deliveryStatus === 'processing').length;
    const completedOrders = orders.filter(o => o.deliveryStatus === 'delivered').length;

    // 3. Stock Level warning warnings
    const lowStockThreshold = 10;
    const lowStockAlerts = await Product.countDocuments({ stock: { $lte: lowStockThreshold } });

    // 4. Sales performance logs (by categories)
    const categoryStats = {};
    for (const order of orders) {
      if (order.paymentStatus !== 'paid') continue;
      for (const item of order.items) {
        if (!categoryStats[item.productId]) {
          categoryStats[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
        }
        categoryStats[item.productId].quantity += item.quantity;
        categoryStats[item.productId].revenue += item.price * item.quantity;
      }
    }

    res.status(200).json({
      productsCount,
      ordersCount,
      customersCount,
      grossRevenue,
      pendingOrders,
      completedOrders,
      lowStockAlerts,
      topProducts: Object.values(categoryStats).sort((a,b) => b.revenue - a.revenue).slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

// --- Product CRUD ---
export const adminAddProduct = async (req, res, next) => {
  try {
    const { name, price, description, category, brand, stock, isFeatured } = req.body;
    let images = [];
    
    if (req.files) {
      images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      images = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    }

    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'); // default fallback
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      name,
      slug,
      price: parseFloat(price),
      description,
      category,
      brand,
      stock: parseInt(stock) || 0,
      images,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      ratings: 0,
      reviewsCount: 0
    });

    res.status(201).json({ message: 'Product added.', product });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.isFeatured) updateData.isFeatured = updateData.isFeatured === 'true' || updateData.isFeatured === true;

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updated = await Product.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    res.status(200).json({ message: 'Product updated.', product: updated });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// --- Order Status moderation ---
export const adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    const updatedOrders = [];

    for (const order of orders) {
      const createdAtMs = new Date(order.createdAt || Date.now()).getTime();
      const isProcessing = (order.deliveryStatus || 'processing').toLowerCase() === 'processing';

      if (isProcessing && (now - createdAtMs >= TWENTY_FOUR_HOURS)) {
        const updates = {
          deliveryStatus: 'shipped',
          'dates.shipped': new Date().toISOString()
        };
        const updated = await Order.findByIdAndUpdate(order._id, { $set: updates }, { new: true });
        updatedOrders.push(updated || order);
      } else {
        updatedOrders.push(order);
      }
    }

    // Deduplicate orders by orderId or _id
    const seenOrderIds = new Set();
    const uniqueOrders = [];
    for (const ord of updatedOrders) {
      const idKey = ord.orderId || ord._id;
      if (!seenOrderIds.has(idKey)) {
        seenOrderIds.add(idKey);
        uniqueOrders.push(ord);
      }
    }

    uniqueOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(uniqueOrders);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body; // processing, shipped, delivered, cancelled

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const updates = { deliveryStatus: status };
    if (status === 'shipped') updates['dates.shipped'] = new Date().toISOString();
    if (status === 'delivered') updates['dates.delivered'] = new Date().toISOString();

    const updated = await Order.findByIdAndUpdate(order._id, { $set: updates }, { new: true });
    res.status(200).json({ message: 'Order delivery status modified.', order: updated });
  } catch (error) {
    next(error);
  }
};

export const adminRefundOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { approve } = req.body; // boolean

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const valStatus = approve ? 'approved' : 'rejected';
    const deliveryUpdates = approve ? 'returned' : order.deliveryStatus;

    const updated = await Order.findByIdAndUpdate(order._id, {
      'returnRequest.status': valStatus,
      deliveryStatus: deliveryUpdates
    }, { new: true });

    res.status(200).json({ message: `Return request ${valStatus}.`, order: updated });
  } catch (error) {
    next(error);
  }
};

// --- Users Management ---
export const adminGetUsers = async (req, res, next) => {
  try {
    const allUsers = await User.find();

    const dummyPatterns = [
      'test realtime', 'strict test', 'pdf tester', 'checkout tester',
      'enterprise pdf', 'pdf verify', 'fresh pdf', 'routing pdf', 'breakdown pdf',
      'devuser22@devstore.com', 'testuser_', 'testdebug_', 'pdftest_', 'strict_'
    ];

    const isDummyUser = (u) => {
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const username = (u.username || '').toLowerCase();

      return dummyPatterns.some(pattern =>
        name.includes(pattern) || email.includes(pattern) || username.includes(pattern)
      );
    };

    const seenEmails = new Set();
    const sanitised = [];

    for (const u of allUsers) {
      const copy = { ...u };
      delete copy.password;
      if (!copy.role) copy.role = 'user';

      const emailKey = (copy.email || '').toLowerCase().trim();
      if (!emailKey || seenEmails.has(emailKey) || isDummyUser(copy)) {
        continue;
      }
      seenEmails.add(emailKey);
      sanitised.push(copy);
    }

    res.status(200).json(sanitised);
  } catch (error) {
    next(error);
  }
};

export const adminPromoteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const targetRole = role || 'admin';
    const updated = await User.findByIdAndUpdate(id, { $set: { role: targetRole } }, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'User not found.' });
    }
    const sanitised = { ...updated };
    delete sanitised.password;
    res.status(200).json({ message: 'User role altered.', user: sanitised });
  } catch (error) {
    next(error);
  }
};

// --- Coupon CRUD ---
export const adminGetCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    next(error);
  }
};

export const adminAddCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minPurchase, expiryDate, usageLimit } = req.body;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase) || 0,
      expiryDate: new Date(expiryDate),
      usageLimit: parseInt(usageLimit) || 100,
      usageCount: 0,
      active: true
    });

    res.status(201).json({ message: 'Coupon created.', coupon });
  } catch (error) {
    next(error);
  }
};

export const adminDeleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    res.status(200).json({ message: 'Coupon deleted.' });
  } catch (error) {
    next(error);
  }
};
