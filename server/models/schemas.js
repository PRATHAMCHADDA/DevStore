import mongoose from 'mongoose';

// 1. User Schema
export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  verified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  resetToken: { type: String },
  resetExpiry: { type: Date },
  loginHistory: [{
    device: String,
    ip: String,
    loginAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// 2. Category Schema
export const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String }
}, { timestamps: true });

// 3. Brand Schema
export const BrandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String }
}, { timestamps: true });

// 4. Product Schema
export const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountedPrice: { type: Number },
  images: [{ type: String }],
  category: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  stock: { type: Number, default: 0 },
  ratings: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  isTodayDeal: { type: Boolean, default: false }
}, { timestamps: true });

// 5. Cart Schema
export const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 }
  }]
}, { timestamps: true });

// 6. Wishlist Schema
export const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  products: [{ type: String }]
}, { timestamps: true });

// 7. Coupon Schema
export const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minPurchase: { type: Number, default: 0 },
  expiryDate: { type: Date, required: true },
  active: { type: Boolean, default: true },
  usageLimit: { type: Number, default: 100 },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

// 8. Address Schema
export const AddressSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// 9. Review Schema
export const ReviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  productId: { type: String, required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  images: [{ type: String }],
  approved: { type: Boolean, default: true } // auto-approve in development
}, { timestamps: true });

// 10. Notification Schema
export const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // 'admin' or userId
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['order', 'payment', 'system'], default: 'system' },
  read: { type: Boolean, default: false }
}, { timestamps: true });

// 11. Order Schema
export const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  billingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: { type: String, required: true },
  paymentId: { type: String },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'processing' },
  prices: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    tax: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true }
  },
  dates: {
    placed: { type: Date, default: Date.now },
    shipped: Date,
    delivered: Date,
    cancelled: Date
  },
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    refundAmount: { type: Number, default: 0 }
  }
}, { timestamps: true });

// 12. Refresh Token Schema
export const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });
