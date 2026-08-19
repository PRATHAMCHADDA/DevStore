import mongoose from 'mongoose';
import { getCollection } from '../utils/jsonDb.js';
import { dbStatus } from '../config/db.js';
import {
  UserSchema,
  CategorySchema,
  BrandSchema,
  ProductSchema,
  CartSchema,
  WishlistSchema,
  CouponSchema,
  AddressSchema,
  ReviewSchema,
  NotificationSchema,
  OrderSchema,
  RefreshTokenSchema
} from './schemas.js';

// Factory loader to dynamically route schema operations
const getModel = (name, schema) => {
  // If MongoDB runs in production mode, returncompiled schema model
  if (dbStatus.mongo === 'production') {
    return mongoose.models[name] || mongoose.model(name, schema);
  }
  // If not, use local collections fallback
  return getCollection(name);
};

export const User = getModel('User', UserSchema);
export const Category = getModel('Category', CategorySchema);
export const Brand = getModel('Brand', BrandSchema);
export const Product = getModel('Product', ProductSchema);
export const Cart = getModel('Cart', CartSchema);
export const Wishlist = getModel('Wishlist', WishlistSchema);
export const Coupon = getModel('Coupon', CouponSchema);
export const Address = getModel('Address', AddressSchema);
export const Review = getModel('Review', ReviewSchema);
export const Notification = getModel('Notification', NotificationSchema);
export const Order = getModel('Order', OrderSchema);
export const RefreshToken = getModel('RefreshToken', RefreshTokenSchema);

// SQL exports
export { Payment, Transaction, Analytics, Revenue, Report, Log, Invoice, syncSQLModels } from './sqlModels.js';
export { dbStatus } from '../config/db.js';
