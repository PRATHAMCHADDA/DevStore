export const getPaymentConfig = async (req, res, next) => {
  try {
    res.status(200).json({
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_sample_stripe_key_12948',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || 'sample_paypal_client_id_98237',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_sample_razor_key_8457'
    });
  } catch (error) {
    next(error);
  }
};

export const createStripeIntent = async (req, res, next) => {
  try {
    const { amount } = req.body;
    res.status(200).json({
      clientSecret: `pi_test_secret_${Math.random().toString(36).substring(2, 15)}`,
      amount
    });
  } catch (error) {
    next(error);
  }
};
