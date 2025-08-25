import { Request, Response } from 'express';
import '../types/express';
import { paymentService } from '../services/paymentService';
import { OrderEnhanced } from '../models/OrderEnhanced';

export class PaymentController {
  
  // Create payment intent
  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentMethodId, savePaymentMethod } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Get order details
      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      // Calculate final amounts including tax and shipping
      const taxAmount = await paymentService.calculateTax(order);
      const shippingAmount = await paymentService.calculateShipping(order);
      const totalAmount = order.subtotal + taxAmount + shippingAmount;

      // Update order with calculated amounts
      order.totalTax = taxAmount;
      order.shippingCost = shippingAmount;
      order.totalAmount = totalAmount;
      await order.save();

      // Create payment intent
      const result = await paymentService.createPaymentIntent({
        orderId: orderId,
        amount: totalAmount,
        currency: order.currency,
        paymentMethodId,
        customerId: userId,
        metadata: {
          orderNumber: order.orderNumber,
          savePaymentMethod
        }
      });

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        paymentIntentId: result.paymentIntentId,
        clientSecret: result.clientSecret,
        requiresAction: result.requiresAction,
        status: result.status
      });

    } catch (error) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Confirm payment
  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const { paymentIntentId, paymentMethodId } = req.body;

      const result = await paymentService.confirmPayment(paymentIntentId, paymentMethodId);

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        status: result.status,
        transactionId: result.transactionId,
        requiresAction: result.requiresAction,
        clientSecret: result.clientSecret
      });

    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process refund
  async processRefund(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { amount, reason } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Verify order belongs to user (for customer refunds) or user is admin
      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId && !(req.user as any)?.isAdmin) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      const result = await paymentService.processRefund({
        orderId,
        amount,
        reason
      });

      if (!result.success) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.json({
        success: true,
        refundId: result.refundId,
        amount: result.amount,
        status: result.status
      });

    } catch (error) {
      console.error('Process refund error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle Stripe webhooks
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const rawBody = req.body;

      await paymentService.handleWebhook(rawBody, signature);

      res.json({ received: true });

    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook verification failed' });
    }
  }

  // Save payment method
  async savePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethodId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const success = await paymentService.savePaymentMethod(userId, paymentMethodId);

      if (!success) {
        res.status(400).json({ error: 'Failed to save payment method' });
        return;
      }

      res.json({ success: true });

    } catch (error) {
      console.error('Save payment method error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get customer payment methods
  async getPaymentMethods(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const paymentMethods = await paymentService.getCustomerPaymentMethods(userId);

      res.json({ paymentMethods });

    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process PayPal payment
  async processPayPalPayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      const result = await paymentService.createPayPalPayment({
        orderId,
        amount: order.totalAmount,
        currency: order.currency,
        customerId: userId
      });

      res.json(result);

    } catch (error) {
      console.error('PayPal payment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process Apple Pay
  async processApplePay(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentMethodId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      const result = await paymentService.processApplePay({
        orderId,
        amount: order.totalAmount,
        currency: order.currency,
        paymentMethodId,
        customerId: userId
      });

      res.json(result);

    } catch (error) {
      console.error('Apple Pay error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Process Google Pay
  async processGooglePay(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, paymentMethodId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      const result = await paymentService.processGooglePay({
        orderId,
        amount: order.totalAmount,
        currency: order.currency,
        paymentMethodId,
        customerId: userId
      });

      res.json(result);

    } catch (error) {
      console.error('Google Pay error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get payment status
  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId && !(req.user as any)?.isAdmin) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      res.json({
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        payment: {
          method: order.payment.method,
          status: order.payment.status,
          amount: order.payment.amount,
          currency: order.payment.currency,
          transactionId: order.payment.transactionId,
          capturedAt: order.payment.capturedAt,
          refunds: order.payment.refunds
        },
        total: order.totalAmount,
        subtotal: order.subtotal,
        tax: order.totalTax,
        shipping: {
          cost: order.shipping.cost,
          method: order.shipping.method
        }
      });

    } catch (error) {
      console.error('Get payment status error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Calculate order totals
  async calculateOrderTotals(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const order = await OrderEnhanced.findById(orderId);
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }

      if (order.customerId.toString() !== userId) {
        res.status(403).json({ error: 'Unauthorized access to order' });
        return;
      }

      const taxAmount = await paymentService.calculateTax(order);
      const shippingAmount = await paymentService.calculateShipping(order);
      const totalAmount = order.subtotal + taxAmount + shippingAmount;

      res.json({
        subtotal: order.subtotal,
        tax: taxAmount,
        shipping: shippingAmount,
        total: totalAmount,
        currency: order.currency
      });

    } catch (error) {
      console.error('Calculate order totals error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const paymentController = new PaymentController();
