import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tab,
  Tabs,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
  LocalShipping
} from '@mui/icons-material';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  inventory: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Product management states
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    inventory: '',
    description: '',
    image: ''
  });
  
  // UI states
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API calls (replace with real API calls)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockProducts: Product[] = [
        { id: '1', name: 'iPhone 15 Pro Max', price: 1199, category: 'Electronics', brand: 'Apple', inventory: 25, status: 'active', createdAt: '2024-01-15' },
        { id: '2', name: 'MacBook Air M3', price: 1299, category: 'Electronics', brand: 'Apple', inventory: 12, status: 'active', createdAt: '2024-01-20' },
        { id: '3', name: 'Sony WH-1000XM5', price: 399, category: 'Electronics', brand: 'Sony', inventory: 3, status: 'active', createdAt: '2024-02-01' },
        { id: '4', name: 'Samsung Neo QLED 8K', price: 2499, category: 'Electronics', brand: 'Samsung', inventory: 8, status: 'active', createdAt: '2024-02-10' }
      ];

      const mockOrders: Order[] = [
        { id: '1', orderNumber: 'ORD-001', customer: 'John Doe', total: 1199, status: 'processing', date: '2024-02-20', items: 2 },
        { id: '2', orderNumber: 'ORD-002', customer: 'Jane Smith', total: 799, status: 'shipped', date: '2024-02-19', items: 1 },
        { id: '3', orderNumber: 'ORD-003', customer: 'Mike Johnson', total: 2499, status: 'delivered', date: '2024-02-18', items: 1 },
        { id: '4', orderNumber: 'ORD-004', customer: 'Sarah Wilson', total: 399, status: 'pending', date: '2024-02-21', items: 3 }
      ];

      const mockStats: DashboardStats = {
        totalProducts: mockProducts.length,
        totalOrders: mockOrders.length,
        totalCustomers: 156,
        totalRevenue: 45678,
        recentOrders: mockOrders.slice(0, 3),
        lowStockProducts: mockProducts.filter(p => p.inventory < 10)
      };

      setProducts(mockProducts);
      setOrders(mockOrders);
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setSnackbar({ open: true, message: 'Failed to load dashboard data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async () => {
    try {
      if (editingProduct) {
        // Update existing product
        const updatedProducts = products.map(p => 
          p.id === editingProduct.id 
            ? { ...p, ...productForm, price: parseFloat(productForm.price), inventory: parseInt(productForm.inventory) }
            : p
        );
        setProducts(updatedProducts);
        setSnackbar({ open: true, message: 'Product updated successfully', severity: 'success' });
      } else {
        // Add new product
        const newProduct: Product = {
          id: Date.now().toString(),
          name: productForm.name,
          price: parseFloat(productForm.price),
          category: productForm.category,
          brand: productForm.brand,
          inventory: parseInt(productForm.inventory),
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0]
        };
        setProducts([...products, newProduct]);
        setSnackbar({ open: true, message: 'Product added successfully', severity: 'success' });
      }
      
      setProductDialog(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: '', category: '', brand: '', inventory: '', description: '', image: '' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to save product', severity: 'error' });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setProducts(products.filter(p => p.id !== productId));
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      } catch (error) {
        setSnackbar({ open: true, message: 'Failed to delete product', severity: 'error' });
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      brand: product.brand,
      inventory: product.inventory.toString(),
      description: '',
      image: ''
    });
    setProductDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Products" />
        <Tab label="Orders" />
        <Tab label="Analytics" />
      </Tabs>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Box>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Inventory color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Products
                      </Typography>
                      <Typography variant="h5">
                        {stats?.totalProducts || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ShoppingCart color="secondary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Orders
                      </Typography>
                      <Typography variant="h5">
                        {stats?.totalOrders || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <People color="info" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Customers
                      </Typography>
                      <Typography variant="h5">
                        {stats?.totalCustomers || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <AttachMoney color="success" sx={{ mr: 2 }} />
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Revenue
                      </Typography>
                      <Typography variant="h5">
                        ${stats?.totalRevenue?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Orders & Low Stock */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Orders
                  </Typography>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Order #</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats?.recentOrders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.orderNumber}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell>${order.total}</TableCell>
                            <TableCell>
                              <Chip 
                                label={order.status} 
                                color={getStatusColor(order.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Low Stock Alert
                  </Typography>
                  <List>
                    {stats?.lowStockProducts.map((product) => (
                      <ListItem key={product.id}>
                        <ListItemText
                          primary={product.name}
                          secondary={`Stock: ${product.inventory}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip 
                            label="Low" 
                            color="warning" 
                            size="small"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Products Tab */}
      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5">Product Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setProductDialog(true)}
            >
              Add Product
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Brand</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Inventory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.brand}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell>
                      <Chip 
                        label={product.inventory}
                        color={product.inventory < 10 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={product.status}
                        color={product.status === 'active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditProduct(product)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteProduct(product.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Orders Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Order Management
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>${order.total}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small">
                        <LocalShipping />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Analytics Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Analytics Dashboard
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales Performance
                  </Typography>
                  <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                    <TrendingUp color="success" sx={{ mr: 1 }} />
                    <Typography>Revenue Growth: +15.2%</Typography>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    Analytics charts would be implemented here using Chart.js or Recharts
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Categories
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText primary="Electronics" secondary="65% of sales" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Kitchen" secondary="20% of sales" />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Sports" secondary="15% of sales" />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Product Dialog */}
      <Dialog open={productDialog} onClose={() => setProductDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Product Name"
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={productForm.price}
            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
            >
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Kitchen">Kitchen</MenuItem>
              <MenuItem value="Living Room">Living Room</MenuItem>
              <MenuItem value="Sports">Sports</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Brand"
            value={productForm.brand}
            onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Inventory"
            type="number"
            value={productForm.inventory}
            onChange={(e) => setProductForm({ ...productForm, inventory: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={productForm.description}
            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Image URL"
            value={productForm.image}
            onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProductDialog(false)}>Cancel</Button>
          <Button onClick={handleProductSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Add'} Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;
