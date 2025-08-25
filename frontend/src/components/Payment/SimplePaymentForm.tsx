import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from '@mui/material';
import {
  CreditCard,
  Security,
  CheckCircle,
  AccountBalance,
  Payment
} from '@mui/icons-material';

interface PaymentFormProps {
  orderId: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: string) => void;
}

const SimplePaymentForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll simulate a successful payment
      if (paymentMethod === 'demo_success') {
        onPaymentSuccess({
          id: `payment_${Date.now()}`,
          status: 'succeeded',
          amount: amount,
          currency: currency,
          orderId: orderId
        });
      } else {
        // Validate basic card info for demo
        if (!cardNumber || !expiryDate || !cvv || !cardName) {
          onPaymentError('Please fill in all card details');
          setIsProcessing(false);
          return;
        }

        // Simple card number validation (demo)
        if (cardNumber.replace(/\s/g, '').length < 16) {
          onPaymentError('Please enter a valid card number');
          setIsProcessing(false);
          return;
        }

        // Simulate successful payment
        onPaymentSuccess({
          id: `payment_${Date.now()}`,
          status: 'succeeded',
          amount: amount,
          currency: currency,
          orderId: orderId,
          paymentMethod: {
            type: 'card',
            card: {
              brand: 'visa',
              last4: cardNumber.slice(-4),
              exp_month: parseInt(expiryDate.split('/')[0]),
              exp_year: parseInt(expiryDate.split('/')[1])
            }
          }
        });
      }
    } catch (error) {
      onPaymentError('Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-numeric characters
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Payment color="primary" />
            Payment Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete your purchase securely
          </Typography>
        </Box>

        <form onSubmit={handlePaymentSubmit}>
          {/* Payment Method Selection */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Payment Method</FormLabel>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              sx={{ mt: 1 }}
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard />
                    Credit/Debit Card
                  </Box>
                }
              />
              <FormControlLabel
                value="demo_success"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle color="success" />
                    Demo Payment (Always Succeeds)
                    <Chip label="Demo" size="small" color="info" />
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {paymentMethod === 'card' && (
            <>
              <Divider sx={{ mb: 3 }} />
              
              {/* Card Details */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    variant="outlined"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    required
                    variant="outlined"
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                    required
                    variant="outlined"
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                    required
                    variant="outlined"
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {paymentMethod === 'demo_success' && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                This is a demo payment method that will always succeed. Perfect for testing the checkout flow!
              </Typography>
            </Alert>
          )}

          {/* Security Notice */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Security color="primary" />
            <Typography variant="body2" color="text.secondary">
              Your payment information is encrypted and secure
            </Typography>
          </Box>

          {/* Total Amount */}
          <Box sx={{ bgcolor: 'primary.50', p: 2, borderRadius: 1, mb: 3 }}>
            <Typography variant="h6" color="primary" textAlign="center">
              Total: ${amount.toFixed(2)} {currency.toUpperCase()}
            </Typography>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={isProcessing}
            sx={{ 
              py: 1.5, 
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
              }
            }}
          >
            {isProcessing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} color="inherit" />
                Processing Payment...
              </Box>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>

          {/* Demo Notice */}
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Demo Mode:</strong> This is a demo payment system. No actual charges will be made.
              Use the "Demo Payment" option for testing.
            </Typography>
          </Alert>
        </form>
      </CardContent>
    </Card>
  );
};

export default SimplePaymentForm;
