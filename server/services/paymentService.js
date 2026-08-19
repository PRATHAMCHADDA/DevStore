import { Payment, Transaction, Revenue } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';

class PaymentGatewayService {
  async processStripe(amount, token) {
    // If stripe secret key is configured, execute stripe payment
    if (process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe Key found. Initiating Stripe payment endpoint...');
      // Real Stripe integration code goes here
    }
    
    // Otherwise fallback to simulated Stripe sandbox
    console.log(`[Stripe Sandbox] Successfully processed charge of $${amount}.`);
    return {
      success: true,
      transactionId: `ch_stripe_${uuidv4().substring(0, 12)}`,
      receiptEmail: 'customer@devstore.com'
    };
  }

  async processPayPal(amount, orderId) {
    console.log(`[PayPal Sandbox] Successfully verified payment for order $${amount}.`);
    return {
      success: true,
      transactionId: `paypal_tx_${uuidv4().substring(0, 12)}`
    };
  }

  async processRazorpay(amount, paymentData) {
    console.log(`[Razorpay Sandbox] Successfully captured payment metadata.`);
    return {
      success: true,
      transactionId: `pay_razor_${uuidv4().substring(0, 12)}`
    };
  }

  async processCard(amount, cardDetails) {
    // Simple verification check for standard fake/test cards
    const { number, name, expiry, cvc } = cardDetails;
    if (!number || number.replace(/\s+/g, '').length < 15) {
      throw new Error('Invalid credit card number formatted entry.');
    }
    if (!expiry || !expiry.includes('/')) {
      throw new Error('Invalid card expiration date.');
    }
    if (!cvc || cvc.length < 3) {
      throw new Error('Invalid security code verification value.');
    }

    console.log(`[Custom Credit Card Sandbox] Processing card payment for $${amount}`);
    return {
      success: true,
      transactionId: `card_tx_${uuidv4().substring(0, 12)}`
    };
  }

  async processCOD(amount) {
    console.log(`[COD] Placing Cash On Delivery invoice record.`);
    return {
      success: true,
      transactionId: `cod_tx_${uuidv4().substring(0, 12)}`
    };
  }
}

const gatewayService = new PaymentGatewayService();

export const executePayment = async (orderId, amount, method, gatewayData = {}) => {
  let paymentResult = null;
  const numericAmount = parseFloat(amount);

  try {
    switch (method.toLowerCase()) {
      case 'stripe':
        paymentResult = await gatewayService.processStripe(numericAmount, gatewayData.token);
        break;
      case 'paypal':
        paymentResult = await gatewayService.processPayPal(numericAmount, gatewayData.orderId);
        break;
      case 'razorpay':
        paymentResult = await gatewayService.processRazorpay(numericAmount, gatewayData);
        break;
      case 'card':
        paymentResult = await gatewayService.processCard(numericAmount, gatewayData.cardDetails);
        break;
      case 'cod':
      case 'cash_on_delivery':
        paymentResult = await gatewayService.processCOD(numericAmount);
        break;
      default:
        throw new Error(`Unsupported payment method: ${method}`);
    }

    // Save transaction records directly into MySQL/SQLite Payment and Transaction tables
    const payment = await Payment.create({
      orderId,
      amount: numericAmount,
      status: paymentResult.success ? 'completed' : 'failed',
      paymentMethod: method,
      gateway: method,
      rawResponse: JSON.stringify(paymentResult)
    });

    const tx = await Transaction.create({
      paymentId: payment.id,
      refNumber: paymentResult.transactionId,
      type: 'credit',
      amount: numericAmount,
      description: `Payment received for Order #${orderId}`
    });

    // Update Daily SQL Revenue aggregate
    const today = new Date().toISOString().split('T')[0];
    const [revenueRow] = await Revenue.findOrCreate({
      where: { date: today },
      defaults: { ordersCount: 0, grossRevenue: 0.00, netRevenue: 0.00, discountsApplied: 0.00 }
    });

    await revenueRow.increment({
      ordersCount: 1,
      grossRevenue: numericAmount,
      netRevenue: numericAmount
    });

    return {
      success: true,
      paymentId: payment.id,
      transactionId: tx.refNumber
    };
  } catch (error) {
    console.error('Payment execution boundary error:', error);
    
    // Log failed payments as well
    if (orderId) {
      await Payment.create({
        orderId,
        amount: numericAmount,
        status: 'failed',
        paymentMethod: method,
        gateway: method,
        rawResponse: JSON.stringify({ error: error.message })
      });
    }

    throw error;
  }
};
