import React from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCartCheckout as CheckoutIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addItem, removeItem, clearCart } from '../store/slices/cartSlice';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, total: totalItems } = useSelector((state: RootState) => state.cart);

  // Sample product data (in real app, this would come from API based on cart items)
  const sampleProducts: { [key: string]: Omit<CartProduct, 'quantity'> } = {
    '1': {
      id: '1',
      name: 'Apple iPhone 15 Pro',
      price: 999,
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'
    },
    '2': {
      id: '2',
      name: 'Sony WH-1000XM5 Headphones',
      price: 399,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    },
    '4': {
      id: '4',
      name: 'MacBook Air M2',
      price: 1199,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'
    },
    '5': {
      id: '5',
      name: 'Samsung 65" 4K Smart TV',
      price: 649,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400'
    }
  };

  const cartProducts: CartProduct[] = cartItems.map(item => ({
    ...sampleProducts[item.productId],
    quantity: item.quantity
  })).filter(product => product.name); // Filter out products not found

  const subtotal = cartProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const shipping = subtotal > 500 ? 0 : 29.99;
  const tax = subtotal * 0.08; // 8% tax
  const orderTotal = subtotal + shipping + tax;

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeItem(productId));
    } else {
      // Remove existing quantity and add new quantity
      dispatch(removeItem(productId));
      dispatch(addItem({ productId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeItem(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (cartProducts.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Shopping Cart
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Your cart is empty. Start shopping to add items!
        </Alert>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/products')}
          sx={{ px: 4, py: 1.5 }}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Shopping Cart ({totalItems} items)
      </Typography>

      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearCart}
              startIcon={<DeleteIcon />}
            >
              Clear Cart
            </Button>
          </Box>

          {cartProducts.map((product) => (
            <Card key={product.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={product.image}
                      alt={product.name}
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6" noWrap>
                      {product.name}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      ${product.price}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <TextField
                        value={product.quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          handleUpdateQuantity(product.id, newQuantity);
                        }}
                        size="small"
                        sx={{ width: 60 }}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                      />
                      <IconButton
                        onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={2}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        ${(product.price * product.quantity).toFixed(2)}
                      </Typography>
                      <IconButton
                        onClick={() => handleRemoveItem(product.id)}
                        color="error"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal:</Typography>
                <Typography>${subtotal.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping:</Typography>
                <Typography>
                  {shipping === 0 ? (
                    <Chip label="FREE" color="success" size="small" />
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Tax:</Typography>
                <Typography>${tax.toFixed(2)}</Typography>
              </Box>
              
              {subtotal < 500 && (
                <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
                  Add ${(500 - subtotal).toFixed(2)} more for FREE shipping!
                </Alert>
              )}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ${orderTotal.toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CheckoutIcon />}
              onClick={() => navigate('/checkout')}
              sx={{ mb: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate('/guest-checkout')}
              sx={{ mb: 2 }}
            >
              Guest Checkout
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </Button>

            {/* Security Features */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                🔒 Secure checkout with SSL encryption
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;
