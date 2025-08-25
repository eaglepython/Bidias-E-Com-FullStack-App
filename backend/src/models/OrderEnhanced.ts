import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  discounts?: {
    type: 'percentage' | 'fixed';
    value: number;
    code?: string;
  }[];
  metadata?: any;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface IPaymentInfo {
  method: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer';
  transactionId: string;
  paymentIntentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';
  amount: number;
  currency: string;
  fees?: number;
  gateway: string;
  gatewayResponse?: any;
  refunds?: IRefund[];
  capturedAt?: Date;
  authorizedAt?: Date;
}

export interface IRefund {
  id: string;
  amount: number;
  reason: string;
  refundId: string;
  status: 'pending' | 'completed' | 'failed';
  processedAt?: Date;
  processedBy: string;
  gatewayRefundId?: string;
  metadata?: any;
}

export interface IShippingInfo {
  method: 'standard' | 'express' | 'overnight' | 'pickup' | 'digital';
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  cost: number;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  attempts: IDeliveryAttempt[];
  status: 'pending' | 'preparing' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned';
  address: IShippingAddress;
  notes?: string;
}

export interface IDeliveryAttempt {
  attemptNumber: number;
  date: Date;
  status: 'delivered' | 'failed' | 'customer_not_available' | 'address_issue';
  notes?: string;
  signature?: string;
  deliveredTo?: string;
}

export interface IOrderDiscount {
  type: 'coupon' | 'loyalty' | 'bulk' | 'seasonal' | 'referral';
  code?: string;
  name: string;
  amount: number;
  percentage?: number;
  appliedTo: 'order' | 'shipping' | 'item';
}

export interface IOrderAnalytics {
  source: 'web' | 'mobile' | 'api' | 'admin';
  referrer?: string;
  campaign?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  location?: {
    country: string;
    state?: string;
    city?: string;
  };
  timeToOrder?: number; // seconds from first visit to order
  sessionId?: string;
}

export interface ITax {
  rate: number;
  amount: number;
  jurisdiction: string;
  type: 'sales' | 'vat' | 'gst';
}

export interface IOrderEnhanced extends Document {
  _id: string;
  orderNumber: string;
  
  // Customer information
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  guestOrder: boolean;
  
  // Order items
  items: IOrderItem[];
  
  // Pricing breakdown
  subtotal: number;
  discounts: IOrderDiscount[];
  totalDiscounts: number;
  taxes: ITax[];
  totalTax: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  
  // Payment
  payment: IPaymentInfo;
  
  // Shipping
  shipping: IShippingInfo;
  billingAddress: IShippingAddress;
  
  // Order status and tracking
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned';
  fulfillmentStatus: 'unfulfilled' | 'partial' | 'fulfilled';
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'partially_paid' | 'refunded' | 'voided';
  
  // Important dates
  placedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  // Communication
  notes: string[];
  internalNotes: string[];
  customerNotes?: string;
  
  // Analytics and tracking
  analytics: IOrderAnalytics;
  
  // Customer service
  supportTickets: string[];
  riskLevel: 'low' | 'medium' | 'high';
  fraudCheck?: {
    score: number;
    status: 'approved' | 'review' | 'declined';
    provider: string;
    details?: any;
  };
  
  // Inventory tracking
  inventoryReserved: boolean;
  reservationExpiry?: Date;
  
  // Returns and exchanges
  returns?: IReturn[];
  exchanges?: IExchange[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  calculateTotals(): void;
  addDiscount(discount: IOrderDiscount): void;
  canCancel(): boolean;
  canRefund(): boolean;
  updateStatus(newStatus: string, note?: string): void;
  generateInvoice(): any;
  trackShipment(): Promise<any>;
}

export interface IReturn {
  id: string;
  items: {
    orderItemId: string;
    quantity: number;
    reason: string;
    condition: 'new' | 'used' | 'damaged';
  }[];
  status: 'requested' | 'approved' | 'in_transit' | 'received' | 'processed' | 'refunded';
  refundAmount: number;
  restockingFee?: number;
  reason: string;
  requestedAt: Date;
  processedAt?: Date;
  trackingNumber?: string;
}

export interface IExchange {
  id: string;
  originalItems: {
    orderItemId: string;
    quantity: number;
  }[];
  newItems: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
  }[];
  status: 'requested' | 'approved' | 'processing' | 'shipped' | 'completed';
  priceDifference: number;
  reason: string;
  requestedAt: Date;
  processedAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  variantId: { type: String },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true },
  discounts: [{
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number },
    code: { type: String }
  }],
  metadata: { type: Schema.Types.Mixed }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  street: { type: String, required: true },
  apartment: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String }
});

const deliveryAttemptSchema = new Schema<IDeliveryAttempt>({
  attemptNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['delivered', 'failed', 'customer_not_available', 'address_issue'],
    required: true
  },
  notes: { type: String },
  signature: { type: String },
  deliveredTo: { type: String }
});

const refundSchema = new Schema<IRefund>({
  id: { type: String, required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  refundId: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  processedAt: { type: Date },
  processedBy: { type: String, required: true },
  gatewayRefundId: { type: String },
  metadata: { type: Schema.Types.Mixed }
});

const returnSchema = new Schema<IReturn>({
  id: { type: String, required: true },
  items: [{
    orderItemId: { type: String, required: true },
    quantity: { type: Number, required: true },
    reason: { type: String, required: true },
    condition: {
      type: String,
      enum: ['new', 'used', 'damaged'],
      required: true
    }
  }],
  status: {
    type: String,
    enum: ['requested', 'approved', 'in_transit', 'received', 'processed', 'refunded'],
    default: 'requested'
  },
  refundAmount: { type: Number, required: true },
  restockingFee: { type: Number, default: 0 },
  reason: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  trackingNumber: { type: String }
});

const exchangeSchema = new Schema<IExchange>({
  id: { type: String, required: true },
  originalItems: [{
    orderItemId: { type: String, required: true },
    quantity: { type: Number, required: true }
  }],
  newItems: [{
    productId: { type: String, required: true },
    variantId: { type: String },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  status: {
    type: String,
    enum: ['requested', 'approved', 'processing', 'shipped', 'completed'],
    default: 'requested'
  },
  priceDifference: { type: Number, required: true },
  reason: { type: String, required: true },
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date }
});

const orderEnhancedSchema = new Schema<IOrderEnhanced>({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Customer information
  customerId: { type: String, required: true, index: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  guestOrder: { type: Boolean, default: false },
  
  // Order items
  items: {
    type: [orderItemSchema],
    required: true,
    validate: {
      validator: function(items: IOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  discounts: [{
    type: { type: String, enum: ['coupon', 'loyalty', 'bulk', 'seasonal', 'referral'] },
    code: { type: String },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    percentage: { type: Number },
    appliedTo: { type: String, enum: ['order', 'shipping', 'item'], default: 'order' }
  }],
  totalDiscounts: { type: Number, default: 0 },
  taxes: [{
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    jurisdiction: { type: String, required: true },
    type: { type: String, enum: ['sales', 'vat', 'gst'], required: true }
  }],
  totalTax: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  
  // Payment
  payment: {
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'bank_transfer'],
      required: true
    },
    transactionId: { type: String, required: true },
    paymentIntentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'cancelled'],
      default: 'pending'
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    fees: { type: Number, default: 0 },
    gateway: { type: String, required: true },
    gatewayResponse: { type: Schema.Types.Mixed },
    refunds: [refundSchema],
    capturedAt: { type: Date },
    authorizedAt: { type: Date }
  },
  
  // Shipping
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup', 'digital'],
      required: true
    },
    carrier: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    cost: { type: Number, default: 0 },
    estimatedDelivery: { type: Date },
    actualDelivery: { type: Date },
    attempts: [deliveryAttemptSchema],
    status: {
      type: String,
      enum: ['pending', 'preparing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
      default: 'pending'
    },
    address: { type: shippingAddressSchema, required: true },
    notes: { type: String }
  },
  
  billingAddress: { type: shippingAddressSchema, required: true },
  
  // Order status and tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned'],
    default: 'pending',
    index: true
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled'],
    default: 'unfulfilled'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'authorized', 'paid', 'partially_paid', 'refunded', 'voided'],
    default: 'pending'
  },
  
  // Important dates
  placedAt: { type: Date, default: Date.now, index: true },
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Communication
  notes: [{ type: String }],
  internalNotes: [{ type: String }],
  customerNotes: { type: String },
  
  // Analytics and tracking
  analytics: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'admin'],
      default: 'web'
    },
    referrer: { type: String },
    campaign: { type: String },
    device: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    location: {
      country: { type: String },
      state: { type: String },
      city: { type: String }
    },
    timeToOrder: { type: Number },
    sessionId: { type: String }
  },
  
  // Customer service
  supportTickets: [{ type: String }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  fraudCheck: {
    score: { type: Number },
    status: {
      type: String,
      enum: ['approved', 'review', 'declined']
    },
    provider: { type: String },
    details: { type: Schema.Types.Mixed }
  },
  
  // Inventory tracking
  inventoryReserved: { type: Boolean, default: false },
  reservationExpiry: { type: Date },
  
  // Returns and exchanges
  returns: [returnSchema],
  exchanges: [exchangeSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderEnhancedSchema.index({ orderNumber: 1 });
orderEnhancedSchema.index({ customerId: 1, placedAt: -1 });
orderEnhancedSchema.index({ status: 1, placedAt: -1 });
orderEnhancedSchema.index({ 'payment.status': 1 });
orderEnhancedSchema.index({ 'shipping.status': 1 });
orderEnhancedSchema.index({ totalAmount: -1 });

// Virtual fields
orderEnhancedSchema.virtual('netAmount').get(function() {
  return this.totalAmount - this.totalDiscounts;
});

orderEnhancedSchema.virtual('isRefundable').get(function() {
  return ['delivered', 'shipped'].includes(this.status) && 
         this.payment.status === 'completed';
});

orderEnhancedSchema.virtual('isCancellable').get(function() {
  return ['pending', 'confirmed'].includes(this.status);
});

// Instance methods
orderEnhancedSchema.methods.calculateTotals = function(): void {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum: number, item: IOrderItem) => sum + item.total, 0);
  
  // Calculate total discounts
  this.totalDiscounts = this.discounts.reduce((sum: number, discount: IOrderDiscount) => sum + discount.amount, 0);
  
  // Calculate total tax
  this.totalTax = this.taxes.reduce((sum: number, tax: ITax) => sum + tax.amount, 0);
  
  // Calculate total amount
  this.totalAmount = this.subtotal - this.totalDiscounts + this.totalTax + this.shippingCost;
};

orderEnhancedSchema.methods.addDiscount = function(discount: IOrderDiscount): void {
  this.discounts.push(discount);
  this.calculateTotals();
};

orderEnhancedSchema.methods.canCancel = function(): boolean {
  return ['pending', 'confirmed'].includes(this.status);
};

orderEnhancedSchema.methods.canRefund = function(): boolean {
  return ['delivered', 'shipped'].includes(this.status) && 
         this.payment.status === 'completed';
};

orderEnhancedSchema.methods.updateStatus = function(newStatus: string, note?: string): void {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Update timestamps based on status
  const now = new Date();
  switch (newStatus) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'shipped':
      this.shippedAt = now;
      this.shipping.status = 'shipped';
      break;
    case 'delivered':
      this.deliveredAt = now;
      this.shipping.status = 'delivered';
      this.fulfillmentStatus = 'fulfilled';
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
  }
  
  // Add note about status change
  if (note) {
    this.notes.push(`Status changed from ${oldStatus} to ${newStatus}: ${note}`);
  } else {
    this.notes.push(`Status changed from ${oldStatus} to ${newStatus}`);
  }
};

orderEnhancedSchema.methods.generateInvoice = function(): any {
  return {
    orderNumber: this.orderNumber,
    placedAt: this.placedAt,
    customer: {
      email: this.customerEmail,
      name: `${this.billingAddress.firstName} ${this.billingAddress.lastName}`
    },
    items: this.items,
    subtotal: this.subtotal,
    discounts: this.totalDiscounts,
    tax: this.totalTax,
    shipping: this.shippingCost,
    total: this.totalAmount,
    currency: this.currency
  };
};

orderEnhancedSchema.methods.trackShipment = async function(): Promise<any> {
  if (!this.shipping.trackingNumber || !this.shipping.carrier) {
    throw new Error('No tracking information available');
  }
  
  // This would integrate with shipping carrier APIs
  // For now, return mock tracking data
  return {
    trackingNumber: this.shipping.trackingNumber,
    carrier: this.shipping.carrier,
    status: this.shipping.status,
    estimatedDelivery: this.shipping.estimatedDelivery,
    events: this.shipping.attempts
  };
};

// Pre-save middleware
orderEnhancedSchema.pre('save', function(next) {
  // Auto-generate order number if not provided
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Ensure totals are calculated
  this.calculateTotals();
  
  next();
});

export const OrderEnhanced = mongoose.model<IOrderEnhanced>('OrderEnhanced', orderEnhancedSchema);
