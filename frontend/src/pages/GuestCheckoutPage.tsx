import React, { useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CreditCard,
  LocalShipping
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import SimplifiedPaymentForm from '../components/Payment/SimplifiedPaymentForm';

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  street: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const GuestCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, total: totalItems } = useSelector((state: RootState) => state.cart);
  
  const [activeStep, setActiveStep] = useState(0);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  const [billingAddress, setBillingAddress] = useState<ShippingAddress>({
    street: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Sample cart products (same as CartPage)
  const sampleProducts: any = {
    '1': { id: '1', name: 'iPhone 15 Pro Max', price: 1199, image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400' },
    '4': { id: '4', name: 'Sony WH-1000XM5', price: 399, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    '7': { id: '7', name: 'MacBook Air M3', price: 1299, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' }
  };

  const cartProducts = cartItems.map(item => ({
    ...sampleProducts[item.productId],
    quantity: item.quantity
  })).filter(product => product.name);

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 29.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const steps = ['Guest Information', 'Shipping Address', 'Payment'];

  const validateGuestInfo = (): boolean => {
    const newErrors: any = {};
    
    if (!guestInfo.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!guestInfo.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!guestInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) newErrors.email = 'Email is invalid';
    if (!guestInfo.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateShippingAddress = (): boolean => {
    const newErrors: any = {};
    
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (activeStep === 0 && !validateGuestInfo()) return;
    if (activeStep === 1 && !validateShippingAddress()) return;
    
    if (activeStep === 1) {
      // Create guest order before payment
      await createGuestOrder();
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const createGuestOrder = async () => {
    setIsLoading(true);
    try {
      // Simulate order creation
      const newOrderId = 'GUEST-' + Date.now();
      setOrderId(newOrderId);
      
      // In real app, create order via API
      console.log('Creating guest order:', {
        guestInfo,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        items: cartProducts,
        total
      });
      
    } catch (error) {
      console.error('Failed to create order:', error);
      setErrors({ general: 'Failed to create order. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (result: any) => {
    // Redirect to confirmation page
    navigate(`/orders/${orderId}/confirmation`);
  };

  const handlePaymentError = (error: string) => {
    setErrors({ payment: error });
  };

  if (cartProducts.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Guest Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Step 1: Guest Information */}
          {activeStep === 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Guest Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={guestInfo.firstName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={guestInfo.lastName}
                      onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={guestInfo.email}
                      onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={guestInfo.phone}
                      onChange={(e) => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      InputProps={{
                        startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />
                      }}
                    />
                  </Grid>
                </Grid>

                <Alert severity="info" sx={{ mt: 2 }}>
                  Want to save your information for faster checkout? 
                  <Button variant="text" onClick={() => navigate('/register')} sx={{ ml: 1 }}>
                    Create an account
                  </Button>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping Address */}
          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Shipping Address
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      error={!!errors.street}
                      helperText={errors.street}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Apartment, suite, etc. (optional)"
                      value={shippingAddress.apartment}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      error={!!errors.city}
                      helperText={errors.city}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="State"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      error={!!errors.state}
                      helperText={errors.state}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      error={!!errors.zipCode}
                      helperText={errors.zipCode}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                    />
                  }
                  label="Billing address is the same as shipping address"
                />

                {!sameAsShipping && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Billing Address
                    </Typography>
                    {/* Billing address fields (similar to shipping) */}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Street Address"
                          value={billingAddress.street}
                          onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                        />
                      </Grid>
                      {/* Add other billing address fields */}
                    </Grid>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment */}
          {activeStep === 2 && orderId && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <CreditCard sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Payment Information
                </Typography>
                
                {errors.payment && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.payment}
                  </Alert>
                )}
                
                <SimplifiedPaymentForm
                  amount={total}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Next'}
              </Button>
            )}
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            {/* Cart Items */}
            <Box sx={{ mb: 2 }}>
              {cartProducts.map((product) => (
                <Box key={product.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4, marginRight: 12 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {product.quantity}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">
                    ${(product.price * product.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Totals */}
            <Box sx={{ space: 'y-1' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${total.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GuestCheckoutPage;
