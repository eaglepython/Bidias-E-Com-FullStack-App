import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentForm from '../components/Payment/PaymentForm';
import { 
  ShoppingBag, 
  MapPin, 
  Clock, 
  Shield,
  ChevronLeft,
  Edit3
} from 'lucide-react';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantName?: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  shippingAddress: ShippingAddress;
  shippingMethod: string;
  estimatedDelivery: string;
}

const CheckoutPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState<'review' | 'payment' | 'success'>('review');
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load order details
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) return;

      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const orderData = await response.json();
          setOrder(orderData);
        } else {
          navigate('/cart');
        }
      } catch (error) {
        console.error('Failed to load order:', error);
        navigate('/cart');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  // Calculate order totals
  useEffect(() => {
    const calculateTotals = async () => {
      if (!orderId) return;

      try {
        const response = await fetch(`/api/payments/orders/${orderId}/calculate`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const totals = await response.json();
          setOrder(prev => prev ? {
            ...prev,
            subtotal: totals.subtotal,
            tax: totals.tax,
            shipping: totals.shipping,
            total: totals.total
          } : null);
        }
      } catch (error) {
        console.error('Failed to calculate totals:', error);
      }
    };

    if (order) {
      calculateTotals();
    }
  }, [orderId, order?.id]);

  const handlePaymentSuccess = (result: any) => {
    setPaymentSuccess(true);
    setPaymentStep('success');
    
    // Redirect to order confirmation after a delay
    setTimeout(() => {
      navigate(`/orders/${orderId}/confirmation`);
    }, 3000);
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/cart')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {paymentStep === 'review' && 'Review Your Order'}
            {paymentStep === 'payment' && 'Payment'}
            {paymentStep === 'success' && 'Order Confirmed!'}
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-4">
            <div className={`flex items-center gap-2 ${
              paymentStep === 'review' ? 'text-blue-600' : 'text-green-600'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                paymentStep === 'review' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Review</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 ${
              paymentStep === 'payment' ? 'text-blue-600' : 
              paymentStep === 'success' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                paymentStep === 'payment' ? 'bg-blue-600 text-white' :
                paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            
            <div className="flex-1 h-px bg-gray-300"></div>
            
            <div className={`flex items-center gap-2 ${
              paymentStep === 'success' ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                paymentStep === 'success' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            {paymentStep === 'review' && (
              <div className="space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Order Items ({order.items.length})
                  </h3>
                  
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={`${item.productId}-${item.variantId || 'default'}`} 
                           className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.variantName && (
                            <p className="text-sm text-gray-600">{item.variantName}</p>
                          )}
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Shipping Information
                    </h3>
                    <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Edit3 className="w-4 h-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                          </p>
                          <p className="text-gray-600">{order.shippingAddress.street}</p>
                          {order.shippingAddress.apartment && (
                            <p className="text-gray-600">{order.shippingAddress.apartment}</p>
                          )}
                          <p className="text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                          <p className="text-gray-600">{order.shippingAddress.country}</p>
                          <p className="text-gray-600">{order.shippingAddress.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-gray-900">Delivery Method</p>
                          <p className="text-gray-600 capitalize">{order.shippingMethod}</p>
                          <p className="text-sm text-gray-500">
                            Estimated delivery: {order.estimatedDelivery}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue to Payment */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setPaymentStep('payment')}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {paymentStep === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {paymentError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{paymentError}</p>
                  </div>
                )}
                
                <PaymentForm
                  orderId={order.id}
                  amount={order.total}
                  currency={order.currency}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Payment Successful!
                </h3>
                
                <p className="text-gray-600 mb-6">
                  Your order #{order.orderNumber} has been confirmed and will be processed shortly.
                </p>
                
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <p>✓ Payment processed securely</p>
                  <p>✓ Confirmation email sent</p>
                  <p>✓ Order being prepared</p>
                </div>
                
                <button
                  onClick={() => navigate(`/orders/${orderId}/confirmation`)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Order Details
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">
                    {order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'Free'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900 text-lg">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center text-xs text-gray-500">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Shield className="w-3 h-3" />
                    <span>Secure SSL Encrypted Payment</span>
                  </div>
                  <p>Your payment information is safe and secure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
