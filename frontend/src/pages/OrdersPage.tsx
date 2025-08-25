import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ShoppingBag,
  LocalShipping,
  CheckCircle,
  Cancel,
  MoreVert,
  Visibility,
  Download,
  Refresh
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variantName?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else if (response.status === 401) {
        navigate('/login');
      } else {
        // For now, use mock data if API fails
        const mockOrders: Order[] = [
          {
            id: '1',
            orderNumber: 'ORD-001',
            status: 'delivered',
            createdAt: '2025-08-20T10:30:00Z',
            items: [
              {
                id: '1',
                name: 'Wireless Bluetooth Headphones',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
                price: 99.99,
                quantity: 1
              },
              {
                id: '2',
                name: 'USB-C Cable',
                image: 'https://images.unsplash.com/photo-1558618047-3c0c3e4c3a4c?w=300',
                price: 19.99,
                quantity: 2
              }
            ],
            totals: {
              subtotal: 139.97,
              tax: 11.20,
              shipping: 0.00,
              total: 151.17
            },
            shippingAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            trackingNumber: 'TRK123456789',
            estimatedDelivery: '2025-08-22'
          },
          {
            id: '2',
            orderNumber: 'ORD-002',
            status: 'shipped',
            createdAt: '2025-08-22T14:15:00Z',
            items: [
              {
                id: '3',
                name: 'Smart Watch',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
                price: 199.99,
                quantity: 1
              }
            ],
            totals: {
              subtotal: 199.99,
              tax: 16.00,
              shipping: 9.99,
              total: 225.98
            },
            shippingAddress: {
              street: '456 Oak Ave',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90210',
              country: 'USA'
            },
            trackingNumber: 'TRK987654321',
            estimatedDelivery: '2025-08-25'
          },
          {
            id: '3',
            orderNumber: 'ORD-003',
            status: 'processing',
            createdAt: '2025-08-23T09:45:00Z',
            items: [
              {
                id: '4',
                name: 'Laptop Stand',
                image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300',
                price: 49.99,
                quantity: 1
              },
              {
                id: '5',
                name: 'Wireless Mouse',
                image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300',
                price: 29.99,
                quantity: 1
              }
            ],
            totals: {
              subtotal: 79.98,
              tax: 6.40,
              shipping: 5.99,
              total: 92.37
            },
            shippingAddress: {
              street: '789 Pine St',
              city: 'Chicago',
              state: 'IL',
              zipCode: '60601',
              country: 'USA'
            },
            estimatedDelivery: '2025-08-27'
          }
        ];
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle />;
      case 'shipped':
        return <LocalShipping />;
      case 'cancelled':
        return <Cancel />;
      default:
        return <ShoppingBag />;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, orderId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrderId(orderId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrderId('');
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}/confirmation`);
    handleMenuClose();
  };

  const handleDownloadReceipt = (orderId: string) => {
    // Implement receipt download
    console.log('Downloading receipt for order:', orderId);
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please log in to view your orders.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Log In
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          My Orders
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadOrders}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No orders found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't placed any orders yet. Start shopping to see your orders here.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/products')}>
            Shop Now
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  {/* Order Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Order #{order.orderNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={getStatusIcon(order.status)}
                        label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        color={getStatusColor(order.status) as any}
                        variant="outlined"
                      />
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, order.id)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Order Items */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Items ({order.items.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {order.items.slice(0, 3).map((item) => (
                        <Avatar
                          key={item.id}
                          src={item.image}
                          alt={item.name}
                          variant="rounded"
                          sx={{ width: 56, height: 56 }}
                        />
                      ))}
                      {order.items.length > 3 && (
                        <Avatar
                          variant="rounded"
                          sx={{ width: 56, height: 56, bgcolor: 'grey.100' }}
                        >
                          <Typography variant="caption">
                            +{order.items.length - 3}
                          </Typography>
                        </Avatar>
                      )}
                    </Box>
                  </Box>

                  {/* Order Summary */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Total Amount
                      </Typography>
                      <Typography variant="h6">
                        ${order.totals.total.toFixed(2)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="body2" color="text.secondary">
                        Shipping Address
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </Typography>
                    </Grid>

                    {order.trackingNumber && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Tracking Number
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {order.trackingNumber}
                        </Typography>
                      </Grid>
                    )}

                    {order.estimatedDelivery && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Estimated Delivery
                        </Typography>
                        <Typography variant="body2">
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {/* Action Buttons */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewOrder(order.id)}
                    >
                      View Details
                    </Button>
                    {order.status === 'shipped' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank')}
                      >
                        Track Package
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewOrder(selectedOrderId)}>
          <Visibility sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleDownloadReceipt(selectedOrderId)}>
          <Download sx={{ mr: 1 }} />
          Download Receipt
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default OrdersPage;
