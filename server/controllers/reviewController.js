import { Review, Product, User } from '../models/index.js';

export const createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    // Create Review
    const review = await Review.create({
      userId,
      userName: user.name,
      productId,
      rating: parseInt(rating),
      comment,
      approved: true
    });

    // Update Product average rating and review counts
    const reviews = await Review.find({ productId });
    const count = reviews.length;
    const statsSum = reviews.reduce((sum, rev) => sum + rev.rating, 0);
    const avg = parseFloat((statsSum / count).toFixed(1));

    await Product.findByIdAndUpdate(productId, {
      ratings: avg,
      reviewsCount: count
    });

    res.status(201).json({
      message: 'Review submitted successfully.',
      review
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Check permissions (must be reviewer or admin)
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review.' });
    }

    const productId = review.productId;
    await Review.findByIdAndDelete(id);

    // Re-calculate averages
    const reviews = await Review.find({ productId });
    const count = reviews.length;
    const avg = count > 0 
      ? parseFloat((reviews.reduce((sum, rev) => sum + rev.rating, 0) / count).toFixed(1))
      : 0;

    await Product.findByIdAndUpdate(productId, {
      ratings: avg,
      reviewsCount: count
    });

    res.status(200).json({ message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};
