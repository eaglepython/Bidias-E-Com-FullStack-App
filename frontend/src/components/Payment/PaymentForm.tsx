import React, { useState, useEffect } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { 
  CreditCard, 
  Smartphone, 
  Wallet, 
  Shield, 
  Check,
  Loader2
} from 'lucide-react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY!);

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

interface PaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'paypal'>('card');
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string>('');
  const [saveCard, setSaveCard] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');

  // Card element styling
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666ee8',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  // Load saved payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payments/payment-methods', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSavedPaymentMethods(data.paymentMethods);
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      }
    };

    loadPaymentMethods();
  }, []);

  // Create payment intent
  const createPaymentIntent = async (paymentMethodId?: string) => {
    try {
      const response = await fetch('/api/payments/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId,
          paymentMethodId,
          savePaymentMethod: saveCard
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Handle card payment
  const handleCardPayment = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // Create payment method
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // Create payment intent
      const intentResult = await createPaymentIntent(paymentMethod.id);
      
      if (intentResult.requiresAction) {
        // Handle 3D Secure or other authentication
        const { error: confirmError } = await stripe.confirmCardPayment(
          intentResult.clientSecret
        );

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

      onPaymentSuccess(intentResult);

    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle saved payment method
  const handleSavedPayment = async () => {
    if (!selectedSavedMethod) return;

    setIsProcessing(true);

    try {
      const intentResult = await createPaymentIntent(selectedSavedMethod);
      onPaymentSuccess(intentResult);
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Apple Pay
  const handleApplePay = async () => {
    if (!stripe) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/apple-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId })
      });

      const result = await response.json();
      
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Apple Pay failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Google Pay
  const handleGooglePay = async () => {
    if (!stripe) return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/google-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId })
      });

      const result = await response.json();
      
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Google Pay failed');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle PayPal
  const handlePayPal = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ orderId })
      });

      const result = await response.json();
      
      if (result.success) {
        onPaymentSuccess(result);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'PayPal payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    switch (paymentMethod) {
      case 'card':
        if (selectedSavedMethod) {
          await handleSavedPayment();
        } else {
          await handleCardPayment();
        }
        break;
      case 'apple_pay':
        await handleApplePay();
        break;
      case 'google_pay':
        await handleGooglePay();
        break;
      case 'paypal':
        await handlePayPal();
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Payment Information
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4" />
          <span>Secure payment powered by Stripe</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
              paymentMethod === 'card' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Card</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('apple_pay')}
            className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
              paymentMethod === 'apple_pay' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm font-medium">Apple Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('google_pay')}
            className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
              paymentMethod === 'google_pay' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">Google Pay</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors ${
              paymentMethod === 'paypal' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="text-sm font-medium text-blue-600">PayPal</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Card Payment Options */}
        {paymentMethod === 'card' && (
          <div className="mb-6">
            {/* Saved Payment Methods */}
            {savedPaymentMethods.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saved Payment Methods
                </label>
                <div className="space-y-2">
                  {savedPaymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="savedMethod"
                        value={method.id}
                        checked={selectedSavedMethod === method.id}
                        onChange={(e) => setSelectedSavedMethod(e.target.value)}
                        className="text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium capitalize">
                            {method.card?.brand}
                          </span>
                          <span className="text-sm text-gray-600">
                            •••• {method.card?.last4}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Expires {method.card?.expMonth}/{method.card?.expYear}
                        </div>
                      </div>
                    </label>
                  ))}
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="savedMethod"
                      value=""
                      checked={selectedSavedMethod === ''}
                      onChange={(e) => setSelectedSavedMethod('')}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium">Use new card</span>
                  </label>
                </div>
              </div>
            )}

            {/* New Card Form */}
            {selectedSavedMethod === '' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                  </label>
                  <div className="border border-gray-300 rounded-lg p-3">
                    <CardElement options={cardElementOptions} />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">
                    Save this card for future purchases
                  </span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-lg font-semibold text-gray-900">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.toUpperCase()
              }).format(amount)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Complete Payment
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Your payment information is encrypted and secure</span>
          </div>
        </div>
      </form>
    </div>
  );
};

interface PaymentWrapperProps extends PaymentFormProps {}

const PaymentWrapper: React.FC<PaymentWrapperProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentWrapper;
