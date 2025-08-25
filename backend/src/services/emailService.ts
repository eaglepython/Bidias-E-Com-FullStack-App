import nodemailer from 'nodemailer';
import { IOrderEnhanced } from '../models/OrderEnhanced';
import { IUser } from '../models/User';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

interface OrderEmailData {
  order: IOrderEnhanced;
  customer: IUser | { firstName: string; lastName: string; email: string };
  isGuest?: boolean;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Send order confirmation email
  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    try {
      const { order, customer } = data;
      
      const emailHtml = this.generateOrderConfirmationHTML(order, customer);
      
      const emailOptions: EmailOptions = {
        to: customer.email,
        subject: `Order Confirmation - ${order.orderNumber}`,
        html: emailHtml,
      };

      await this.sendEmail(emailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  // Send order receipt email
  async sendOrderReceipt(data: OrderEmailData): Promise<boolean> {
    try {
      const { order, customer } = data;
      
      const emailHtml = this.generateOrderReceiptHTML(order, customer);
      
      const emailOptions: EmailOptions = {
        to: customer.email,
        subject: `Receipt for Order ${order.orderNumber}`,
        html: emailHtml,
      };

      await this.sendEmail(emailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send order receipt email:', error);
      return false;
    }
  }

  // Send shipping notification
  async sendShippingNotification(data: OrderEmailData & { trackingNumber?: string }): Promise<boolean> {
    try {
      const { order, customer, trackingNumber } = data;
      
      const emailHtml = this.generateShippingNotificationHTML(order, customer, trackingNumber);
      
      const emailOptions: EmailOptions = {
        to: customer.email,
        subject: `Your Order ${order.orderNumber} Has Shipped!`,
        html: emailHtml,
      };

      await this.sendEmail(emailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send shipping notification email:', error);
      return false;
    }
  }

  // Send password reset email
  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const emailHtml = this.generatePasswordResetHTML(resetUrl);
      
      const emailOptions: EmailOptions = {
        to: email,
        subject: 'Password Reset Request - Bidias E-Com',
        html: emailHtml,
      };

      await this.sendEmail(emailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  // Send welcome email for new users
  async sendWelcomeEmail(user: IUser): Promise<boolean> {
    try {
      const emailHtml = this.generateWelcomeHTML(user);
      
      const emailOptions: EmailOptions = {
        to: user.email,
        subject: 'Welcome to Bidias E-Com!',
        html: emailHtml,
      };

      await this.sendEmail(emailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  // Core email sending method
  private async sendEmail(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: `"Bidias E-Com" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // HTML Templates
  private generateOrderConfirmationHTML(order: any, customer: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { background: #667eea; color: white; padding: 15px; text-align: center; font-size: 18px; font-weight: bold; }
            .button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmed!</h1>
                <p>Thank you for your purchase, ${customer.firstName}!</p>
            </div>
            
            <div class="content">
                <h2>Order Details</h2>
                <div class="order-details">
                    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || '5-7 business days'}</p>
                    
                    <h3>Items Ordered:</h3>
                    ${order.items.map((item: any) => `
                        <div class="item">
                            <div>
                                <strong>${item.name}</strong><br>
                                <small>Quantity: ${item.quantity}</small>
                            </div>
                            <div>$${(item.price * item.quantity).toFixed(2)}</div>
                        </div>
                    `).join('')}
                    
                    <div class="total">
                        Total: $${order.total.toFixed(2)}
                    </div>
                </div>
                
                <h3>Shipping Address:</h3>
                <div class="order-details">
                    <p>
                        ${order.shipping?.address?.firstName} ${order.shipping?.address?.lastName}<br>
                        ${order.shipping?.address?.street}<br>
                        ${order.shipping?.address?.apartment ? order.shipping.address.apartment + '<br>' : ''}
                        ${order.shipping?.address?.city}, ${order.shipping?.address?.state} ${order.shipping?.address?.zipCode}<br>
                        ${order.shipping?.address?.country}
                    </p>
                </div>
                
                <a href="${process.env.FRONTEND_URL}/orders/${order._id}" class="button">
                    Track Your Order
                </a>
                
                <p>We'll send you another email when your order ships. If you have any questions, please contact our customer service team.</p>
                
                <p>Thanks for shopping with Bidias E-Com!</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateOrderReceiptHTML(order: any, customer: any): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Receipt</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
            .receipt { background: white; padding: 30px; border: 1px solid #ddd; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .totals { margin-top: 20px; padding-top: 20px; border-top: 2px solid #2c3e50; }
            .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-size: 18px; font-weight: bold; background: #2c3e50; color: white; padding: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Payment Receipt</h1>
                <p>Receipt for Order ${order.orderNumber}</p>
            </div>
            
            <div class="receipt">
                <h2>Receipt Details</h2>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Order Number:</strong> ${order.orderNumber}</p>
                <p><strong>Payment Method:</strong> ${order.payment?.method || 'Credit Card'}</p>
                <p><strong>Transaction ID:</strong> ${order.payment?.transactionId}</p>
                
                <h3>Items Purchased:</h3>
                ${order.items.map((item: any) => `
                    <div class="item">
                        <div>
                            <strong>${item.name}</strong><br>
                            <small>Qty: ${item.quantity} × $${item.price.toFixed(2)}</small>
                        </div>
                        <div>$${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
                
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Shipping:</span>
                        <span>$${order.shipping.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>Tax:</span>
                        <span>$${order.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>Total Paid:</span>
                        <span>$${order.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    This receipt serves as proof of purchase. Please keep it for your records.
                    For questions about this order, contact customer service at support@bidias.com
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateShippingNotificationHTML(order: any, customer: any, trackingNumber?: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Shipped</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #27ae60; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .tracking { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
            .tracking-number { font-size: 24px; font-weight: bold; color: #27ae60; margin: 15px 0; }
            .button { background: #27ae60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🚚 Your Order is On Its Way!</h1>
                <p>Order ${order.orderNumber} has shipped</p>
            </div>
            
            <div class="content">
                <p>Great news, ${customer.firstName}! Your order has been shipped and is on its way to you.</p>
                
                ${trackingNumber ? `
                <div class="tracking">
                    <h3>Tracking Information</h3>
                    <p>Tracking Number:</p>
                    <div class="tracking-number">${trackingNumber}</div>
                    <a href="#" class="button">Track Package</a>
                </div>
                ` : ''}
                
                <h3>What's being shipped:</h3>
                ${order.items.map((item: any) => `
                    <p>• ${item.name} (Qty: ${item.quantity})</p>
                `).join('')}
                
                <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || '2-3 business days'}</p>
                
                <p>We'll send you another email when your package is delivered. Thanks for shopping with us!</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generatePasswordResetHTML(resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e74c3c; color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔒 Password Reset Request</h1>
            </div>
            
            <div class="content">
                <p>You requested a password reset for your Bidias E-Com account.</p>
                
                <p>Click the button below to reset your password:</p>
                
                <a href="${resetUrl}" class="button">Reset Password</a>
                
                <div class="warning">
                    <p><strong>Security Notice:</strong></p>
                    <ul>
                        <li>This link will expire in 15 minutes</li>
                        <li>If you didn't request this reset, please ignore this email</li>
                        <li>Never share this link with anyone</li>
                    </ul>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generateWelcomeHTML(user: IUser): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Bidias E-Com</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Bidias E-Com!</h1>
                <p>Hi ${user.firstName}, thanks for joining our community!</p>
            </div>
            
            <div class="content">
                <p>We're excited to have you on board! Here's what you can do with your new account:</p>
                
                <div class="feature">
                    <h3>🤖 Meet Nate - Your AI Shopping Assistant</h3>
                    <p>Get personalized product recommendations and shopping help from our advanced AI assistant.</p>
                </div>
                
                <div class="feature">
                    <h3>🛍️ Browse 70+ Premium Products</h3>
                    <p>Discover electronics, kitchen appliances, living room furniture, and sports equipment.</p>
                </div>
                
                <div class="feature">
                    <h3>🎯 Smart Recommendations</h3>
                    <p>Our ML-powered system learns your preferences to suggest products you'll love.</p>
                </div>
                
                <div class="feature">
                    <h3>🔒 Secure Shopping</h3>
                    <p>Shop with confidence using our secure payment system powered by Stripe.</p>
                </div>
                
                <a href="${process.env.FRONTEND_URL}/products" class="button">
                    Start Shopping Now
                </a>
                
                <p>If you have any questions, our customer support team is here to help at support@bidias.com</p>
                
                <p>Happy shopping!</p>
                <p>The Bidias E-Com Team</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

export const emailService = new EmailService();
