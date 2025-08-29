import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
  Divider,
  Avatar,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Share as ShareIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Star as StarIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../store';
import { addItem } from '../store/slices/cartSlice';
import { productAPI, userAPI } from '../services/api';

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: {
    original: number;
    current: number;
    currency: string;
  };
  images: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }>;
  category: string;
  brand: string;
  ratings: {
    average: number;
    count: number;
    distribution: Record<string, number>;
  };
  inventory: {
    stock: number;
    lowStockThreshold: number;
    status: string;
  };
  features: string[];
  specifications: any;
  reviews: any[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response: any = await productAPI.getProduct(id!);
      const { product, recommendations, relatedProducts } = response?.data || {};
      
      setProduct(product);
      setRecommendations(recommendations || []);
      setRelatedProducts(relatedProducts || []);

      // Check if product is in wishlist
      if (user) {
        checkWishlistStatus();
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load product details',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async () => {
    try {
  const response: any = await userAPI.getWishlist();
  const wishlist = response?.data?.data?.wishlist || [];
      setIsInWishlist(wishlist.includes(id));
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      dispatch(addItem({
        productId: product._id,
        quantity
      }));
      
      setSnackbar({
        open: true,
        message: `Added ${quantity} ${product.name} to cart`,
        severity: 'success'
      });
    }
  };

  const handleBuyNow = () => {
    if (product) {
      // Add to cart first
      dispatch(addItem({
        productId: product._id,
        quantity
      }));
      
      // Navigate directly to cart for checkout
      navigate('/cart');
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isInWishlist) {
        await userAPI.removeFromWishlist(id!);
        setIsInWishlist(false);
        setSnackbar({
          open: true,
          message: 'Removed from wishlist',
          severity: 'success'
        });
      } else {
        await userAPI.addToWishlist(id!);
        setIsInWishlist(true);
        setSnackbar({
          open: true,
          message: 'Added to wishlist',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Wishlist operation failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update wishlist',
        severity: 'error'
      });
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await productAPI.addReview(id!, reviewForm);
      setReviewDialogOpen(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      fetchProductData(); // Refresh product data
      setSnackbar({
        open: true,
        message: 'Review submitted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit review',
        severity: 'error'
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard',
          severity: 'success'
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard',
        severity: 'success'
      });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!product) {
    return (
      <Container>
        <Typography variant="h4" textAlign="center" mt={4}>
          Product not found
        </Typography>
      </Container>
    );
  }

  // Defensive fallback for images
  const images = product.images && product.images.length > 0 ? product.images : [{ url: '', alt: product.name, isPrimary: true }];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 4 }}>
        <Link color="inherit" href="/" onClick={() => navigate('/')}>
          Home
        </Link>
        <Link color="inherit" href="/products" onClick={() => navigate('/products')}>
          Products
        </Link>
        <Link color="inherit" href={`/products?category=${product.category}`}>
          {product.category}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Box>
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CardMedia
                component="img"
                image={images[selectedImageIndex]?.url}
                alt={images[selectedImageIndex]?.alt || product.name}
                sx={{
                  width: '100%',
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 2,
                  mb: 2
                }}
              />
            </motion.div>
            {/* Image Thumbnails */}
            <Box display="flex" gap={1} flexWrap="wrap">
              {images.map((image, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    cursor: 'pointer',
                    border: selectedImageIndex === index ? 2 : 1,
                    borderColor: selectedImageIndex === index ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    overflow: 'hidden',
                    width: 80,
                    height: 80
                  }}
                >
                  <CardMedia
                    component="img"
                    image={image.url}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Rating value={product.ratings?.average || 0} readOnly precision={0.1} />
              <Typography variant="body2" color="text.secondary">
                ({product.ratings?.count || 0} reviews)
              </Typography>
            </Box>

            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price?.current?.toFixed(2) || 'N/A'}
            </Typography>

            <Typography variant="body1" paragraph>
              {product.description}
            </Typography>

            {/* Features */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Key Features
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {product.features?.map((feature, index) => (
                  <Chip key={index} label={feature} size="small" />
                ))}
              </Box>
            </Box>

            {/* Quantity Selector */}
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Typography variant="body1">Quantity:</Typography>
              <Box display="flex" alignItems="center" border={1} borderColor="grey.300" borderRadius={1}>
                <IconButton
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  size="small"
                >
                  <RemoveIcon />
                </IconButton>
                <Typography sx={{ px: 2, minWidth: 40, textAlign: 'center' }}>
                  {quantity}
                </Typography>
                <IconButton
                  onClick={() => setQuantity(quantity + 1)}
                  size="small"
                >
                  <AddIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" flexDirection="column" gap={2} mb={3}>
              {/* Primary Buy Now Button */}
              <Button
                variant="contained"
                size="large"
                startIcon={<CartIcon />}
                onClick={handleBuyNow}
                disabled={product.inventory?.status !== 'in_stock'}
                sx={{ 
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  },
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                {product.inventory.status === 'in_stock' ? 'Buy Now' : 'Out of Stock'}
              </Button>
              
              {/* Secondary Actions */}
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<CartIcon />}
                  onClick={handleAddToCart}
                  disabled={product.inventory.status !== 'in_stock'}
                  sx={{ flex: 1 }}
                >
                  Add to Cart
                </Button>
                
                <IconButton
                  onClick={handleWishlistToggle}
                  color={isInWishlist ? 'error' : 'default'}
                  sx={{ border: 1, borderColor: 'grey.300' }}
                >
                  {isInWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                
                <IconButton
                  onClick={handleShare}
                  sx={{ border: 1, borderColor: 'grey.300' }}
                >
                  <ShareIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Stock Status */}
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: product.inventory.status === 'in_stock' ? 'success.main' : 'error.main'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {product.inventory.status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box mt={6}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label={`Reviews (${product.ratings.count})`} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="body1">
            {product.description}
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {product.specifications && (
            <Grid container spacing={2}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" fontWeight="bold">
                      {key}:
                    </Typography>
                    <Typography variant="body2">
                      {String(value)}
                    </Typography>
                  </Box>
                  <Divider />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box mb={3}>
            <Button
              variant="outlined"
              onClick={() => setReviewDialogOpen(true)}
              disabled={!user}
            >
              {user ? 'Write a Review' : 'Login to Write a Review'}
            </Button>
          </Box>

          {product.reviews?.map((review, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar>{review.userName?.[0] || 'U'}</Avatar>
                  <Box>
                    <Typography variant="subtitle2">
                      {review.userName || 'Anonymous User'}
                    </Typography>
                    <Rating value={review.rating} readOnly size="small" />
                  </Box>
                </Box>
                {review.title && (
                  <Typography variant="subtitle1" gutterBottom>
                    {review.title}
                  </Typography>
                )}
                <Typography variant="body2">
                  {review.comment}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </TabPanel>
      </Box>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Recommended for You
          </Typography>
          <Grid container spacing={2}>
            {recommendations.slice(0, 4).map((rec: any) => (
              <Grid item xs={12} sm={6} md={3} key={rec.id}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/products/${rec.id}`)}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={rec.image}
                    alt={rec.name}
                  />
                  <CardContent>
                    <Typography variant="body2" noWrap>
                      {rec.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${rec.price}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={reviewForm.rating}
              onChange={(_, newValue) => setReviewForm({ ...reviewForm, rating: newValue || 1 })}
            />
          </Box>
          
          <TextField
            fullWidth
            label="Review Title"
            value={reviewForm.title}
            onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            value={reviewForm.comment}
            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProductDetailPage;
