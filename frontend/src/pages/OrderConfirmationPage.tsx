import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar
} from '@mui/material';
import {
  CheckCircle,
  LocalShipping,
  Receipt,
  Email,
  Download,
  Home
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface OrderConfirmationData {
  orderNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
  shipping: {
    address: {
      street: string;
      apartment?: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    method: string;
    estimatedDelivery: string;
  };
  payment: {
    method: string;
    last4?: string;
    transactionId: string;
  };
  status: string;
  orderDate: string;
}

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<OrderConfirmationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadOrderConfirmation();
  }, [orderId]);

  const loadOrderConfirmation = async () => {
    try {
      // Simulate API call (replace with real API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock order data
      const mockOrder: OrderConfirmationData = {
        orderNumber: `ORD-${orderId?.slice(-6).toUpperCase()}`,
        customer: {
          name: 'John Doe',
          email: 'john.doe@email.com'
        },
        items: [
          {
            id: '1',
            name: 'iPhone 15 Pro Max',
            image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
            price: 1199,
            quantity: 1
          },
          {
            id: '2',
            name: 'Sony WH-1000XM5',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
            price: 399,
            quantity: 1
          }
        ],
        totals: {
          subtotal: 1598,
          shipping: 0,
          tax: 127.84,
          total: 1725.84
        },
        shipping: {
          address: {
            street: '123 Main St',
            apartment: 'Apt 4B',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'US'
          },
          method: 'Standard Shipping',
          estimatedDelivery: '3-5 business days'
        },
        payment: {
          method: 'Credit Card',
          last4: '4242',
          transactionId: 'ch_1234567890'
        },
        status: 'confirmed',
        orderDate: new Date().toISOString()
      };
      
      setOrder(mockOrder);
    } catch (err) {
      setError('Failed to load order confirmation');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Simulate receipt download
    console.log('Downloading receipt...');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Order not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 4 }}>
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h3" gutterBottom color="success.main">
          Order Confirmed!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Thank you for your purchase, {order.customer.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Order #{order.orderNumber} • {new Date(order.orderDate).toLocaleDateString()}
        </Typography>
      </Box>

      {/* Status Timeline */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order Status
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3} textAlign="center">
              <CheckCircle color="success" sx={{ mb: 1 }} />
              <Typography variant="body2" fontWeight="bold" color="success.main">
                Order Placed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(order.orderDate).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="center">
              <Receipt color="action" sx={{ mb: 1 }} />
              <Typography variant="body2">
                Processing
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Within 24 hours
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="center">
              <LocalShipping color="action" sx={{ mb: 1 }} />
              <Typography variant="body2">
                Shipped
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1-2 business days
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3} textAlign="center">
              <Home color="action" sx={{ mb: 1 }} />
              <Typography variant="body2">
                Delivered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {order.shipping.estimatedDelivery}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Order Details */}
        <Grid item xs={12} lg={8}>
          {/* Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              <List>
                {order.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar
                          src={item.image}
                          alt={item.name}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`Quantity: ${item.quantity}`}
                        sx={{ ml: 2 }}
                      />
                      <Typography variant="h6">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </ListItem>
                    {index < order.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Shipping Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Shipping Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Delivery Address
                  </Typography>
                  <Typography variant="body2">
                    {order.shipping.address.street}
                    {order.shipping.address.apartment && <><br />{order.shipping.address.apartment}</>}
                    <br />
                    {order.shipping.address.city}, {order.shipping.address.state} {order.shipping.address.zipCode}
                    <br />
                    {order.shipping.address.country}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Shipping Method
                  </Typography>
                  <Typography variant="body2">
                    {order.shipping.method}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated delivery: {order.shipping.estimatedDelivery}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Payment Method
                  </Typography>
                  <Typography variant="body2">
                    {order.payment.method} ending in {order.payment.last4}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {order.payment.transactionId}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${order.totals.subtotal.toFixed(2)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {order.totals.shipping === 0 ? 'Free' : `$${order.totals.shipping.toFixed(2)}`}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>${order.totals.tax.toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">
                  Total:
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  ${order.totals.total.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Action Buttons */}
            <Box sx={{ space: 'y-2' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Email />}
                sx={{ mb: 1 }}
              >
                Email Receipt
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Download />}
                onClick={handleDownloadReceipt}
                sx={{ mb: 1 }}
              >
                Download Receipt
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={handlePrintReceipt}
                sx={{ mb: 1 }}
              >
                Print Receipt
              </Button>
              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Contact Info */}
            <Alert severity="info">
              <Typography variant="body2">
                You'll receive an email confirmation at {order.customer.email}. 
                For questions, contact us at support@bidias.com
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OrderConfirmationPage;
