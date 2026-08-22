import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Order, Product, Cart, Coupon, Notification, Invoice } from '../models/index.js';
import { executePayment } from '../services/paymentService.js';
import { generateInvoicePDF } from '../services/invoiceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mail Simulation Helper
const sendSimulatedEmail = (to, subject, html) => {
  console.log(`\n==================================================`);
  console.log(`📨 SIMULATING EMAIL SENT TO: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`==================================================\n`);
};

export const placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      gatewayData = {}
    } = req.body;

    // 1. Fetch Cart
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty.' });
    }

    // 2. Fetch items details and verify stock
    const items = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${cartItem.productId}` });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Only ${product.stock} units available.`
        });
      }

      const activePrice = product.discountedPrice || product.price;

      items.push({
        productId: product._id.toString(),
        name: product.name,
        image: product.images[0] || '',
        quantity: cartItem.quantity,
        price: activePrice
      });

      subtotal += activePrice * cartItem.quantity;
    }

    // 3. Address Validations
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Complete shipping address is required.' });
    }

    // 4. Calculate prices
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = parseFloat((subtotal * 0.15).toFixed(2)); // 15% VAT tax
    let discount = 0;

    // 5. Coupon validation
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon && new Date() <= new Date(coupon.expiryDate) && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === 'percentage') {
          discount = parseFloat(((subtotal * coupon.discountValue) / 100).toFixed(2));
        } else {
          discount = coupon.discountValue;
        }

        // Limit discount to subtotal
        if (discount > subtotal) discount = subtotal;

        // Increment coupon count
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usageCount: 1 } });
      }
    }

    const grandTotal = parseFloat((subtotal + shipping + tax - discount).toFixed(2));

    // 6. Generate order ID
    const orderId = `DEV-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order document (pending state)
    const newOrder = await Order.create({
      orderId,
      userId,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      deliveryStatus: 'processing',
      prices: {
        subtotal,
        shipping,
        tax,
        discount,
        grandTotal
      }
    });

    // 7. Execute payment
    let checkPayment = { success: false, transactionId: '' };
    if (paymentMethod.toLowerCase() === 'cod') {
      checkPayment = { success: true, transactionId: `cod_tx_${orderId}` };
    } else {
      try {
        checkPayment = await executePayment(orderId, grandTotal, paymentMethod, gatewayData);
      } catch (payErr) {
        // Delete pending order on fail
        await Order.findByIdAndDelete(newOrder._id);
        return res.status(400).json({ message: payErr.message || 'Payment execution failed.' });
      }
    }

    // 8. Update Order Payment Status
    const finalOrder = await Order.findByIdAndUpdate(newOrder._id, {
      paymentStatus: checkPayment.success ? 'paid' : 'pending',
      paymentId: checkPayment.transactionId
    }, { new: true });

    // 9. Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    // 10. Generate PDF invoice in the background
    let pdfUrl = '';
    try {
      // Direct call to services helper
      pdfUrl = await generateInvoicePDF(finalOrder);
    } catch (pdfErr) {
      console.error('Failed to write PDF invoice copy:', pdfErr.message);
    }

    // 11. Clear Cart
    await Cart.findByIdAndUpdate(cart._id, { $set: { items: [] } });

    // 12. Notify customer & send confirmation email
    await Notification.create({
      userId,
      title: 'Order Placed Successfully!',
      message: `Your order #${orderId} of $${grandTotal} was confirmed. We are packaging it now.`,
      type: 'order'
    });

    // Admin alert
    await Notification.create({
      userId: 'admin',
      title: 'New Order Received',
      message: `Order #${orderId} has been placed by user for $${grandTotal}.`,
      type: 'order'
    });

    sendSimulatedEmail(
      req.user.email,
      `Order Confirmation #${orderId} - DevStore`,
      `<h1>Thank you for your order!</h1><p>Your order #${orderId} of $${grandTotal} has been placed. Payment method: ${paymentMethod}. Download invoice copy once available.</p>`
    );

    res.status(201).json({
      message: 'Order created successfully.',
      order: finalOrder,
      pdfUrl
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user.id });
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

    updatedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(updatedOrders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const createdAtMs = new Date(order.createdAt || Date.now()).getTime();
    const isProcessing = (order.deliveryStatus || 'processing').toLowerCase() === 'processing';

    if (isProcessing && (now - createdAtMs >= TWENTY_FOUR_HOURS)) {
      const updates = {
        deliveryStatus: 'shipped',
        'dates.shipped': new Date().toISOString()
      };
      const updated = await Order.findByIdAndUpdate(order._id, { $set: updates }, { new: true });
      return res.status(200).json(updated || order);
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (order.deliveryStatus !== 'processing') {
      return res.status(400).json({ message: 'Orders that are already shipped or delivered cannot be cancelled.' });
    }

    // Restore stock levels
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity }
      });
    }

    const updated = await Order.findByIdAndUpdate(order._id, {
      deliveryStatus: 'cancelled',
      'dates.cancelled': new Date().toISOString()
    }, { new: true });

    res.status(200).json({ message: 'Order has been cancelled successfully.', order: updated });
  } catch (error) {
    next(error);
  }
};

export const requestOrderReturn = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (order.deliveryStatus !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be flagged for return.' });
    }

    if (order.returnRequest && order.returnRequest.isRequested) {
      return res.status(400).json({ message: 'Return already requested for this order.' });
    }

    const updated = await Order.findByIdAndUpdate(order._id, {
      returnRequest: {
        isRequested: true,
        reason,
        status: 'pending',
        refundAmount: order.prices.grandTotal
      }
    }, { new: true });

    res.status(200).json({ message: 'Return request submitted.', order: updated });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoiceFile = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Search order by orderId or _id in Mongoose / Sequelize
    let order = await Order.findOne({ orderId });
    if (!order && Order.findOne) {
      try { order = await Order.findOne({ where: { orderId } }); } catch (e) {}
    }
    if (!order && Order.findById) {
      try { order = await Order.findById(orderId); } catch (e) {}
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Call the updated invoice service generator
    const relativePdfPath = await generateInvoicePDF(order);

    const fileName = `invoice_${order.orderId}.pdf`;
    const candidatePaths = [
      path.resolve(process.cwd(), relativePdfPath.startsWith('/') ? relativePdfPath.slice(1) : relativePdfPath),
      path.resolve(process.cwd(), 'server', relativePdfPath.startsWith('/') ? relativePdfPath.slice(1) : relativePdfPath),
      path.resolve(__dirname, '../uploads/invoices', fileName)
    ];

    const absolutePath = candidatePaths.find(p => fs.existsSync(p));

    if (!absolutePath || !fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Invoice PDF file not found.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${order.orderId}.pdf"`);
    return res.sendFile(absolutePath);
  } catch (err) {
    console.error('Invoice controller error:', err);
    return res.status(500).json({ message: 'Error generating invoice', error: err.message });
  }
};
