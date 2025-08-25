import React, { useState } from 'react';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Box,
  Button,
  Typography,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RynwMRw8VocUqTd7VwdVt7ez7BCeEaBtdRVPlKP0eFkZMNcJngacDhiSB5vUiUFx6JZ5Qki8Fr77WrbCnzEA9BN00IrLRUlh8');

interface SimplifiedPaymentFormProps {
  amount: number;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const SimplifiedPaymentFormInner: React.FC<SimplifiedPaymentFormProps> = ({
  amount,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '12px',
        iconColor: '#666ee8',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onPaymentError('Stripe has not loaded yet. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onPaymentError('Card element not found.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment method
      const { error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Customer Name',
          email: 'customer@example.com',
        },
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // In a real app, you would create a payment intent on your backend
      // For demo purposes, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentSucceeded(true);
      setIsProcessing(false);
      
      // Simulate successful payment
      setTimeout(() => {
        onPaymentSuccess({ 
          success: true, 
          paymentIntentId: 'pi_demo_' + Date.now(),
          amount: amount 
        });
      }, 1500);

    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
        <Typography variant="h5" color="success.main" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Your order has been processed successfully.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CreditCardIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6">Payment Information</Typography>
        </Box>

        <Box sx={{ 
          border: '1px solid #ddd', 
          borderRadius: 1, 
          p: 2, 
          mb: 3,
          '& .StripeElement': {
            height: '20px',
          }
        }}>
          <CardElement options={cardElementOptions} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SecurityIcon sx={{ mr: 1, color: 'success.main', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Your payment information is encrypted and secure
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Total Amount:</Typography>
          <Typography variant="h6" color="primary.main">
            ${amount.toFixed(2)}
          </Typography>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={!stripe || isProcessing}
          sx={{ py: 1.5 }}
        >
          {isProcessing ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Processing Payment...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Demo Mode:</strong> Use test card number 4242 4242 4242 4242 with any future expiry date and any CVC.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

const SimplifiedPaymentForm: React.FC<SimplifiedPaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <SimplifiedPaymentFormInner {...props} />
    </Elements>
  );
};

export default SimplifiedPaymentForm;
