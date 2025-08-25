import Stripe from 'stripe';
import { OrderEnhanced, IOrderEnhanced } from '../models/OrderEnhanced';
import { UserEnhanced } from '../models/UserEnhanced';
import { ProductEnhanced } from '../models/ProductEnhanced';
import { emailService } from './emailService';

interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  customerId: string;
  metadata?: any;
}

interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentIntentId?: string;
  status: string;
  amount: number;
  fees?: number;
  error?: string;
  requiresAction?: boolean;
  clientSecret?: string;
}

interface RefundRequest {
  orderId: string;
  amount?: number;
  reason: string;
  refundId?: string;
}

interface RefundResult {
  success: boolean;
  refundId?: string;
  amount: number;
  status: string;
  error?: string;
}

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16'
    });
  }

  // Create payment intent for order
  async createPaymentIntent(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const order = await OrderEnhanced.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Create or retrieve customer
      const customer = await this.getOrCreateStripeCustomer(request.customerId);

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        customer: customer.id,
        payment_method: request.paymentMethodId,
        confirmation_method: 'manual',
        confirm: !!request.paymentMethodId,
        metadata: {
          orderId: request.orderId,
          customerId: request.customerId,
          ...request.metadata
        },
        description: `Order ${order.orderNumber}`,
        shipping: {
          name: `${order.shipping.address.firstName} ${order.shipping.address.lastName}`,
          address: {
            line1: order.shipping.address.street,
            line2: order.shipping.address.apartment || undefined,
            city: order.shipping.address.city,
            state: order.shipping.address.state,
            postal_code: order.shipping.address.zipCode,
            country: order.shipping.address.country
          }
        }
      });

      // Update order with payment information
      await this.updateOrderPayment(order, {
        method: 'stripe',
        transactionId: paymentIntent.id,
        paymentIntentId: paymentIntent.id,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: request.amount,
        currency: request.currency,
        gateway: 'stripe',
        gatewayResponse: paymentIntent
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: request.amount,
        requiresAction: paymentIntent.status === 'requires_action',
        clientSecret: paymentIntent.client_secret || undefined
      };

    } catch (error) {
      console.error('Payment intent creation error:', error);
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Confirm payment intent
  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentResult> {
    try {
      const confirmParams: any = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

  const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      // Update order status
      if (paymentIntent.metadata.orderId) {
        const order = await OrderEnhanced.findById(paymentIntent.metadata.orderId);
        if (order) {
          order.payment.status = this.mapStripeStatus(paymentIntent.status as any);
          if (paymentIntent.status === 'succeeded') {
            order.payment.capturedAt = new Date();
            order.paymentStatus = 'paid';
            order.status = 'confirmed';
            order.confirmedAt = new Date();
          }
          await order.save();
        }
      }

  const pi = paymentIntent as Stripe.PaymentIntent & { charges?: { data: Array<{ balance_transaction?: string }> } };
  const firstCharge = (pi.charges && Array.isArray(pi.charges.data)) ? (pi.charges.data[0] as any) : undefined;
      return {
        success: paymentIntent.status === 'succeeded',
        transactionId: pi.id,
        paymentIntentId: pi.id,
        status: pi.status,
        amount: pi.amount / 100,
        fees: firstCharge?.balance_transaction 
          ? await this.getStripeFees(firstCharge.balance_transaction as string)
          : undefined,
        requiresAction: pi.status === 'requires_action',
        clientSecret: pi.client_secret || undefined
      };

    } catch (error) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        status: 'failed',
        amount: 0,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      };
    }
  }

  // Process refund
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      const order = await OrderEnhanced.findById(request.orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (!order.payment.paymentIntentId) {
        throw new Error('No payment to refund');
      }

      // Create refund
  const refund = await this.stripe.refunds.create({
        payment_intent: order.payment.paymentIntentId,
        amount: request.amount ? Math.round(request.amount * 100) : undefined,
        reason: this.mapRefundReason(request.reason),
        metadata: {
          orderId: request.orderId,
          reason: request.reason
        }
      });

      // Update order with refund information
      const refundData: any = {
        id: request.refundId || `ref_${Date.now()}`,
        amount: refund.amount / 100,
        reason: request.reason,
        refundId: refund.id,
        status: refund.status === 'succeeded' ? 'completed' : 'pending',
        processedAt: refund.status === 'succeeded' ? new Date() : undefined,
        processedBy: 'system',
        gatewayRefundId: refund.id
      };

      order.payment.refunds = order.payment.refunds || [];
      order.payment.refunds.push(refundData);

      // Update payment status
      const totalRefunded = order.payment.refunds.reduce((sum, r) => sum + r.amount, 0);
      if (totalRefunded >= order.payment.amount) {
        order.payment.status = 'refunded';
        order.paymentStatus = 'refunded';
        order.status = 'refunded';
      } else {
        order.payment.status = 'partially_refunded';
        order.paymentStatus = 'partially_paid';
      }

      await order.save();

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
        status: refund.status || 'succeeded'
      };

    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        amount: request.amount || 0,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Refund processing failed'
      };
    }
  }

  // Handle webhook events
  async handleWebhook(rawBody: string, signature: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
          break;
        
        case 'charge.dispute.created':
          await this.handleDispute(event.data.object as Stripe.Dispute);
          break;
        
        case 'refund.updated':
          await this.handleRefundUpdate(event.data.object as Stripe.Refund);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  // PayPal integration methods
  async createPayPalPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // PayPal integration would go here
      // For now, return a placeholder implementation
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        error: 'PayPal integration not yet implemented'
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        error: error instanceof Error ? error.message : 'PayPal payment failed'
      };
    }
  }

  // Apple Pay integration
  async processApplePay(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Apple Pay would use Stripe's Apple Pay integration
      return await this.createPaymentIntent({
        ...request,
        metadata: { ...request.metadata, paymentMethod: 'apple_pay' }
      });
    } catch (error) {
      console.error('Apple Pay error:', error);
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        error: error instanceof Error ? error.message : 'Apple Pay failed'
      };
    }
  }

  // Google Pay integration
  async processGooglePay(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Google Pay would use Stripe's Google Pay integration
      return await this.createPaymentIntent({
        ...request,
        metadata: { ...request.metadata, paymentMethod: 'google_pay' }
      });
    } catch (error) {
      console.error('Google Pay error:', error);
      return {
        success: false,
        status: 'failed',
        amount: request.amount,
        error: error instanceof Error ? error.message : 'Google Pay failed'
      };
    }
  }

  // Saved payment methods
  async savePaymentMethod(customerId: string, paymentMethodId: string): Promise<boolean> {
    try {
      const customer = await this.getOrCreateStripeCustomer(customerId);
      
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id
      });

      return true;
    } catch (error) {
      console.error('Save payment method error:', error);
      return false;
    }
  }

  async getCustomerPaymentMethods(customerId: string): Promise<any[]> {
    try {
      const customer = await this.getOrCreateStripeCustomer(customerId);
      
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customer.id,
        type: 'card'
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          expMonth: pm.card.exp_month,
          expYear: pm.card.exp_year
        } : null
      }));
    } catch (error) {
      console.error('Get payment methods error:', error);
      return [];
    }
  }

  // Private helper methods
  private async getOrCreateStripeCustomer(userId: string): Promise<Stripe.Customer> {
    const user = await UserEnhanced.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a Stripe customer ID
    const existingCustomers = await this.stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      metadata: {
        userId: userId
      }
    });
  }

  private async updateOrderPayment(order: IOrderEnhanced, paymentData: any): Promise<void> {
    order.payment = {
      ...order.payment,
      ...paymentData
    };
    await order.save();
  }

  private mapStripeStatus(stripeStatus: string): 'processing' | 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled' {
    const statusMap: { [key: string]: 'processing' | 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled' } = {
      'requires_payment_method': 'pending',
      'requires_confirmation': 'pending',
      'requires_action': 'pending',
      'processing': 'processing',
      'succeeded': 'completed',
      'canceled': 'cancelled'
    };

    return statusMap[stripeStatus] || 'pending';
  }

  private mapRefundReason(reason: string): Stripe.RefundCreateParams.Reason {
    const reasonMap: { [key: string]: Stripe.RefundCreateParams.Reason } = {
      'requested_by_customer': 'requested_by_customer',
      'duplicate': 'duplicate',
      'fraudulent': 'fraudulent'
    };

    return reasonMap[reason] || 'requested_by_customer';
  }

  private async getStripeFees(balanceTransactionId: string): Promise<number> {
    try {
      const balanceTransaction = await this.stripe.balanceTransactions.retrieve(balanceTransactionId);
      return balanceTransaction.fee / 100;
    } catch (error) {
      console.error('Get Stripe fees error:', error);
      return 0;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    if (paymentIntent.metadata.orderId) {
      const order = await OrderEnhanced.findById(paymentIntent.metadata.orderId);
      if (order) {
        order.payment.status = 'completed';
        order.payment.capturedAt = new Date();
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.confirmedAt = new Date();
        await order.save();

        // Reserve inventory
        await this.reserveInventory(order);

        // Send email receipts
        try {
          const customer = await UserEnhanced.findById(order.customerId);
          if (customer) {
            await emailService.sendOrderConfirmation({ order, customer });
            await emailService.sendOrderReceipt({ order, customer });
          }
        } catch (error) {
          console.error('Failed to send order emails:', error);
        }
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    if (paymentIntent.metadata.orderId) {
      const order = await OrderEnhanced.findById(paymentIntent.metadata.orderId);
      if (order) {
        order.payment.status = 'failed';
        order.paymentStatus = 'pending';
        await order.save();
      }
    }
  }

  private async handleDispute(dispute: Stripe.Dispute): Promise<void> {
    // Handle dispute logic
    console.log('Payment dispute created:', dispute.id);
  }

  private async handleRefundUpdate(refund: Stripe.Refund): Promise<void> {
    // Handle refund update logic
    console.log('Refund updated:', refund.id);
  }

  private async reserveInventory(order: IOrderEnhanced): Promise<void> {
    try {
      for (const item of order.items) {
        const product = await ProductEnhanced.findById(item.productId);
        if (product) {
          if (item.variantId) {
            const variant = product.getVariantBySku(item.variantId);
            if (variant && variant.inventory.trackInventory) {
              variant.inventory.quantity -= item.quantity;
            }
          } else if (product.inventory.trackInventory) {
            product.inventory.totalQuantity -= item.quantity;
          }
          await product.save();
        }
      }

      order.inventoryReserved = true;
      await order.save();
    } catch (error) {
      console.error('Inventory reservation error:', error);
    }
  }

  // Calculate taxes
  async calculateTax(order: IOrderEnhanced): Promise<number> {
    try {
      // Basic tax calculation - in production, integrate with tax service
      const taxRate = this.getTaxRate(order.shipping.address.state, order.shipping.address.country);
      return order.subtotal * taxRate;
    } catch (error) {
      console.error('Tax calculation error:', error);
      return 0;
    }
  }

  private getTaxRate(state: string, country: string): number {
    // Simplified tax rates - in production, use a tax service
    if (country === 'US') {
      const stateTaxRates: { [key: string]: number } = {
        'CA': 0.0875, // California
        'NY': 0.08,   // New York
        'TX': 0.0625, // Texas
        'FL': 0.06    // Florida
      };
      return stateTaxRates[state] || 0.05; // Default 5%
    }
    return 0; // No tax for international orders (simplified)
  }

  // Shipping calculation
  async calculateShipping(order: IOrderEnhanced): Promise<number> {
    try {
      // Basic shipping calculation
      const weight = this.calculateOrderWeight(order);
      const distance = await this.calculateShippingDistance(order.shipping.address);
      
      return this.getShippingRate(weight, distance, order.shipping.method);
    } catch (error) {
      console.error('Shipping calculation error:', error);
      return 0;
    }
  }

  private calculateOrderWeight(order: IOrderEnhanced): number {
    // Calculate total weight from products
    return order.items.reduce((weight, item) => weight + (item.quantity * 1), 0); // Assume 1 lb per item
  }

  private async calculateShippingDistance(address: any): Promise<number> {
    // In production, integrate with shipping APIs
    return 500; // Mock distance in miles
  }

  private getShippingRate(weight: number, distance: number, method: string): number {
    const baseRates = {
      'standard': 5.99,
      'express': 12.99,
      'overnight': 24.99,
      'pickup': 0,
      'digital': 0
    };

    let rate = baseRates[method as keyof typeof baseRates] || 5.99;

    // Add weight surcharge
    if (weight > 5) {
      rate += (weight - 5) * 0.5;
    }

    // Add distance surcharge for express/overnight
    if (['express', 'overnight'].includes(method) && distance > 1000) {
      rate += 5;
    }

    return rate;
  }
}

export const paymentService = new PaymentService();
