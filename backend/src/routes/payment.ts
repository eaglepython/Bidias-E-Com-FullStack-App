import express from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create payment intent
router.post('/payment-intent', authenticateToken, paymentController.createPaymentIntent.bind(paymentController));

// Confirm payment
router.post('/confirm-payment', authenticateToken, paymentController.confirmPayment.bind(paymentController));

// Process refund
router.post('/orders/:orderId/refund', authenticateToken, paymentController.processRefund.bind(paymentController));

// Stripe webhook
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), paymentController.handleWebhook.bind(paymentController));

// Payment methods management
router.post('/payment-methods', authenticateToken, paymentController.savePaymentMethod.bind(paymentController));
router.get('/payment-methods', authenticateToken, paymentController.getPaymentMethods.bind(paymentController));

// Alternative payment methods
router.post('/paypal', authenticateToken, paymentController.processPayPalPayment.bind(paymentController));
router.post('/apple-pay', authenticateToken, paymentController.processApplePay.bind(paymentController));
router.post('/google-pay', authenticateToken, paymentController.processGooglePay.bind(paymentController));

// Payment status and calculations
router.get('/orders/:orderId/status', authenticateToken, paymentController.getPaymentStatus.bind(paymentController));
router.get('/orders/:orderId/calculate', authenticateToken, paymentController.calculateOrderTotals.bind(paymentController));

export default router;
