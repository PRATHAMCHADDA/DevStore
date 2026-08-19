import { Coupon } from '../models/index.js';

export const getActiveCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({ active: true });
    // Filter out expired coupons on read
    const validCoupons = coupons.filter(c => new Date() <= new Date(c.expiryDate));
    res.status(200).json(validCoupons);
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code.' });
    }

    if (!coupon.active) {
      return res.status(400).json({ message: 'This coupon is no longer active.' });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({ message: 'This coupon has expired.' });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'This coupon has reached its maximum usage limit.' });
    }

    if (subtotal < coupon.minPurchase) {
      return res.status(400).json({ message: `Minimum purchase of $${coupon.minPurchase} is required for this coupon.` });
    }

    // Success response returning discount configs
    res.status(200).json({
      message: 'Coupon validated successfully.',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchase: coupon.minPurchase
      }
    });
  } catch (error) {
    next(error);
  }
};
