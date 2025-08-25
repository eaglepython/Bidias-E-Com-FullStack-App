import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Container,
  Rating,
  Chip,
  IconButton,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import {
  SmartToy,
  Recommend,
  TrendingUp,
  Security,
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addItem } from '../store/slices/cartSlice';
import NotificationSnackbar from '../components/common/NotificationSnackbar';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  onSale?: boolean;
  discount?: number;
}

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  useEffect(() => {
    // AI-curated featured products for electronics enthusiasts
    setFeaturedProducts([
      {
        id: '1',
        name: 'iPhone 15 Pro Max',
        price: 1199,
        originalPrice: 1299,
        image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
        rating: 4.9,
        reviewCount: 4521,
        onSale: true,
        discount: 8
      },
      {
        id: '4',
        name: 'Sony WH-1000XM5',
        price: 399,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        rating: 4.8,
        reviewCount: 5923
      },
      {
        id: '7',
        name: 'MacBook Air M3',
        price: 1299,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        rating: 4.9,
        reviewCount: 2841
      },
      {
        id: '10',
        name: 'Samsung Neo QLED 8K',
        price: 2499,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
        rating: 4.7,
        reviewCount: 892,
        onSale: true,
        discount: 17
      },
      {
        id: '13',
        name: 'PlayStation 5 Pro',
        price: 699,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        rating: 4.8,
        reviewCount: 3456
      },
      {
        id: '21',
        name: 'Apple Watch Ultra 2',
        price: 799,
        image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400',
        rating: 4.8,
        reviewCount: 2134
      },
      {
        id: '16',
        name: 'Canon EOS R5 Mark II',
        price: 4299,
        image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
        rating: 4.9,
        reviewCount: 234
      },
      {
        id: '23',
        name: 'iPad Pro M3',
        price: 1099,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        rating: 4.9,
        reviewCount: 1567
      }
    ]);
  }, []);

  const handleAddToCart = (product: FeaturedProduct) => {
    dispatch(addItem({
      productId: product.id,
      quantity: 1
    }));
    
    // Show success notification
    setNotification({
      open: true,
      message: `${product.name} added to cart!`,
      severity: 'success'
    });
  };

  const handleBuyNow = (product: FeaturedProduct) => {
    // Add to cart first
    dispatch(addItem({
      productId: product.id,
      quantity: 1
    }));
    
    // Navigate directly to cart for checkout
    navigate('/cart');
  };
  const features = [
    {
      icon: <SmartToy sx={{ fontSize: 40 }} />,
      title: 'AI Shopping Assistant',
      description: 'Get personalized help finding the perfect products with our intelligent chatbot.',
    },
    {
      icon: <Recommend sx={{ fontSize: 40 }} />,
      title: 'Smart Recommendations',
      description: 'Discover products you\'ll love with our advanced recommendation engine.',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Trend Analysis',
      description: 'Stay ahead with AI-powered trend insights and demand forecasting.',
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure Shopping',
      description: 'Shop with confidence using our secure, AI-monitored platform.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700, mb: 2 }}
            >
              The Future of AI-Powered Electronics Shopping
            </Typography>
            <Typography
              variant="h5"
              sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}
            >
              Experience Bidias E-Com with AI recommendations, smart price analysis,
              and personalized electronics discovery powered by machine learning.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/products"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  px: 4,
                  py: 1.5,
                }}
              >
                Start Shopping
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  px: 4,
                  py: 1.5,
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose Our Platform?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 4 }}
        >
          AI-Curated Electronics Collection
        </Typography>
        
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    transition: 'all 0.2s ease-in-out',
                  },
                }}
              >
                {/* Sale Badge */}
                {product.onSale && product.discount && (
                  <Chip
                    label={`-${product.discount}%`}
                    color="error"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ cursor: 'pointer' }}
                />

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {product.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={product.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      ({product.reviewCount})
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      ${product.price}
                    </Typography>
                    {product.originalPrice && (
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          ml: 1,
                        }}
                      >
                        ${product.originalPrice}
                      </Typography>
                    )}
                  </Box>

                  <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="small"
                        startIcon={<CartIcon />}
                        onClick={() => handleBuyNow(product)}
                        sx={{
                          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                          }
                        }}
                      >
                        Buy Now
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        startIcon={<CartIcon />}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <IconButton color="default" size="small">
                        <FavoriteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/products"
            sx={{ px: 4, py: 1.5 }}
          >
            View All Products
          </Button>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.50',
          py: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Experience AI Shopping?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of satisfied customers who have discovered
              the power of intelligent e-commerce.
            </Typography>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/register"
              sx={{ px: 4, py: 1.5 }}
            >
              Get Started Today
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Notification Snackbar */}
      <NotificationSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default HomePage;
