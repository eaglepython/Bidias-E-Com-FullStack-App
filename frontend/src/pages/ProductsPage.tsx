import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Rating,
  IconButton,
  Pagination,
  CircularProgress,
  Paper,
  InputAdornment,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Slider,
  Fab
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Visibility as ViewIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { addItem } from '../store/slices/cartSlice';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  subcategory?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  featured: boolean;
  onSale: boolean;
  discount?: number;
}

const ProductsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 3000]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Sample products data with extensive electronics catalog
  const sampleProducts: Product[] = [
    // Smartphones
    {
      id: '1',
      name: 'Apple iPhone 15 Pro Max',
      description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system with Action Button',
      price: 1199,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400',
      category: 'Electronics',
      subcategory: 'Smartphones',
      brand: 'Apple',
      rating: 4.9,
      reviewCount: 4521,
      inStock: true,
      stockCount: 15,
      tags: ['5G', 'iOS', 'Premium', 'A17 Pro', 'Titanium'],
      featured: true,
      onSale: true,
      discount: 8
    },
    {
      id: '2',
      name: 'Samsung Galaxy S24 Ultra',
      description: 'Flagship Android phone with S Pen, 200MP camera, and AI-powered features',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      category: 'Electronics',
      subcategory: 'Smartphones',
      brand: 'Samsung',
      rating: 4.8,
      reviewCount: 3892,
      inStock: true,
      stockCount: 12,
      tags: ['5G', 'Android', 'S Pen', 'AI Camera', '200MP'],
      featured: true,
      onSale: false
    },
    {
      id: '3',
      name: 'Google Pixel 8 Pro',
      description: 'Google\'s flagship with Tensor G3 chip, Magic Eraser, and pure Android experience',
      price: 999,
      originalPrice: 1099,
      image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=400',
      category: 'Electronics',
      subcategory: 'Smartphones',
      brand: 'Google',
      rating: 4.7,
      reviewCount: 2156,
      inStock: true,
      stockCount: 18,
      tags: ['5G', 'Android', 'AI Photography', 'Tensor G3'],
      featured: false,
      onSale: true,
      discount: 9
    },

    // Audio Devices
    {
      id: '4',
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Industry-leading noise canceling wireless headphones with 30-hour battery life',
      price: 399,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'Sony',
      rating: 4.8,
      reviewCount: 5923,
      inStock: true,
      stockCount: 25,
      tags: ['Wireless', 'Noise Canceling', 'Premium', '30h Battery'],
      featured: true,
      onSale: false
    },
    {
      id: '5',
      name: 'Apple AirPods Pro (3rd Gen)',
      description: 'Adaptive Audio, Personalized Spatial Audio, and USB-C charging case',
      price: 249,
      originalPrice: 279,
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'Apple',
      rating: 4.6,
      reviewCount: 8234,
      inStock: true,
      stockCount: 35,
      tags: ['Wireless', 'Noise Canceling', 'Spatial Audio', 'USB-C'],
      featured: true,
      onSale: true,
      discount: 11
    },
    {
      id: '6',
      name: 'Bose QuietComfort Ultra',
      description: 'Premium noise-canceling headphones with Immersive Audio technology',
      price: 429,
      image: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'Bose',
      rating: 4.7,
      reviewCount: 1876,
      inStock: true,
      stockCount: 15,
      tags: ['Wireless', 'Immersive Audio', 'Premium', 'Comfort'],
      featured: false,
      onSale: false
    },

    // Laptops & Computers
    {
      id: '7',
      name: 'MacBook Air M3 15-inch',
      description: 'Supercharged by M3 chip with 18-hour battery life and stunning Liquid Retina display',
      price: 1299,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      category: 'Electronics',
      subcategory: 'Laptops',
      brand: 'Apple',
      rating: 4.9,
      reviewCount: 2841,
      inStock: true,
      stockCount: 8,
      tags: ['M3 Chip', 'Portable', 'macOS', '18h Battery', 'Retina'],
      featured: true,
      onSale: false
    },
    {
      id: '8',
      name: 'Dell XPS 13 Plus',
      description: 'Ultra-premium laptop with 12th Gen Intel processors and stunning InfinityEdge display',
      price: 1099,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      category: 'Electronics',
      subcategory: 'Laptops',
      brand: 'Dell',
      rating: 4.5,
      reviewCount: 1923,
      inStock: true,
      stockCount: 12,
      tags: ['Intel 12th Gen', 'Windows 11', 'InfinityEdge', 'Premium'],
      featured: false,
      onSale: true,
      discount: 8
    },
    {
      id: '9',
      name: 'ASUS ROG Zephyrus G16',
      description: 'High-performance gaming laptop with RTX 4070 and AMD Ryzen 9 processor',
      price: 1899,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400',
      category: 'Electronics',
      subcategory: 'Laptops',
      brand: 'ASUS',
      rating: 4.6,
      reviewCount: 756,
      inStock: true,
      stockCount: 6,
      tags: ['Gaming', 'RTX 4070', 'AMD Ryzen 9', 'High Performance'],
      featured: false,
      onSale: false
    },

    // TVs & Displays
    {
      id: '10',
      name: 'Samsung 65" Neo QLED 8K',
      description: 'Neural Quantum Processor 8K with AI upscaling and Quantum HDR 32X',
      price: 2499,
      originalPrice: 2999,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      category: 'Electronics',
      subcategory: 'TV & Home Theater',
      brand: 'Samsung',
      rating: 4.7,
      reviewCount: 892,
      inStock: true,
      stockCount: 5,
      tags: ['8K', 'Neo QLED', 'AI Upscaling', 'Smart TV', 'HDR'],
      featured: true,
      onSale: true,
      discount: 17
    },
    {
      id: '11',
      name: 'LG C3 55" OLED 4K',
      description: 'Self-lit OLED pixels with α9 Gen6 AI Processor 4K and webOS 23',
      price: 1399,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1601944177325-f8867652837f?w=400',
      category: 'Electronics',
      subcategory: 'TV & Home Theater',
      brand: 'LG',
      rating: 4.8,
      reviewCount: 1234,
      inStock: true,
      stockCount: 8,
      tags: ['OLED', '4K', 'AI Processor', 'Smart TV', 'webOS'],
      featured: true,
      onSale: true,
      discount: 13
    },
    {
      id: '12',
      name: 'Sony Bravia XR A95L 77"',
      description: 'QD-OLED display with Cognitive Processor XR and Perfect for PlayStation 5',
      price: 3999,
      image: 'https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=400',
      category: 'Electronics',
      subcategory: 'TV & Home Theater',
      brand: 'Sony',
      rating: 4.9,
      reviewCount: 432,
      inStock: true,
      stockCount: 3,
      tags: ['QD-OLED', 'Cognitive XR', 'PS5 Ready', 'Premium'],
      featured: false,
      onSale: false
    },

    // Gaming & Consoles
    {
      id: '13',
      name: 'PlayStation 5 Pro',
      description: 'Next-gen gaming console with ray tracing and 8K gaming capabilities',
      price: 699,
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
      category: 'Electronics',
      subcategory: 'Gaming',
      brand: 'Sony',
      rating: 4.8,
      reviewCount: 3456,
      inStock: true,
      stockCount: 4,
      tags: ['Gaming', '8K Ready', 'Ray Tracing', 'Next Gen'],
      featured: true,
      onSale: false
    },
    {
      id: '14',
      name: 'Xbox Series X',
      description: 'Most powerful Xbox ever with 12 teraflops and Smart Delivery technology',
      price: 499,
      image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400',
      category: 'Electronics',
      subcategory: 'Gaming',
      brand: 'Microsoft',
      rating: 4.7,
      reviewCount: 2891,
      inStock: true,
      stockCount: 7,
      tags: ['Gaming', '12 Teraflops', 'Smart Delivery', '4K Gaming'],
      featured: true,
      onSale: false
    },
    {
      id: '15',
      name: 'Nintendo Switch OLED',
      description: 'Vibrant 7-inch OLED screen and enhanced audio for handheld and docked gaming',
      price: 349,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      category: 'Electronics',
      subcategory: 'Gaming',
      brand: 'Nintendo',
      rating: 4.6,
      reviewCount: 4567,
      inStock: true,
      stockCount: 15,
      tags: ['Handheld', 'OLED', 'Portable', 'Family Gaming'],
      featured: false,
      onSale: false
    },

    // Cameras & Photography
    {
      id: '16',
      name: 'Canon EOS R5 Mark II',
      description: 'Professional mirrorless camera with 45MP full-frame sensor and 8K video recording',
      price: 4299,
      image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
      category: 'Electronics',
      subcategory: 'Cameras',
      brand: 'Canon',
      rating: 4.9,
      reviewCount: 234,
      inStock: true,
      stockCount: 3,
      tags: ['Professional', 'Mirrorless', '45MP', '8K Video'],
      featured: true,
      onSale: false
    },
    {
      id: '17',
      name: 'Sony Alpha A7R V',
      description: '61MP full-frame mirrorless with AI-based autofocus and 8K 24p video',
      price: 3899,
      originalPrice: 4199,
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
      category: 'Electronics',
      subcategory: 'Cameras',
      brand: 'Sony',
      rating: 4.8,
      reviewCount: 567,
      inStock: true,
      stockCount: 5,
      tags: ['61MP', 'AI Autofocus', '8K Video', 'Professional'],
      featured: false,
      onSale: true,
      discount: 7
    },
    {
      id: '18',
      name: 'Fujifilm X-T5',
      description: 'APS-C mirrorless camera with 40MP sensor and classic film simulation modes',
      price: 1699,
      image: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=400',
      category: 'Electronics',
      subcategory: 'Cameras',
      brand: 'Fujifilm',
      rating: 4.7,
      reviewCount: 891,
      inStock: true,
      stockCount: 8,
      tags: ['APS-C', '40MP', 'Film Simulation', 'Compact'],
      featured: false,
      onSale: false
    },

    // Smart Home & IoT
    {
      id: '19',
      name: 'Amazon Echo Studio',
      description: 'High-fidelity smart speaker with 3D audio and built-in Zigbee hub',
      price: 199,
      originalPrice: 229,
      image: 'https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?w=400',
      category: 'Electronics',
      subcategory: 'Smart Home',
      brand: 'Amazon',
      rating: 4.4,
      reviewCount: 5678,
      inStock: true,
      stockCount: 25,
      tags: ['Smart Speaker', '3D Audio', 'Alexa', 'Zigbee Hub'],
      featured: false,
      onSale: true,
      discount: 13
    },
    {
      id: '20',
      name: 'Google Nest Hub Max',
      description: '10-inch smart display with Google Assistant and video calling capabilities',
      price: 229,
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400',
      category: 'Electronics',
      subcategory: 'Smart Home',
      brand: 'Google',
      rating: 4.3,
      reviewCount: 3421,
      inStock: true,
      stockCount: 18,
      tags: ['Smart Display', 'Google Assistant', 'Video Calling', '10-inch'],
      featured: false,
      onSale: false
    },

    // Wearables
    {
      id: '21',
      name: 'Apple Watch Ultra 2',
      description: 'Most rugged Apple Watch with Action Button, titanium case, and 36-hour battery',
      price: 799,
      image: 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=400',
      category: 'Electronics',
      subcategory: 'Wearables',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 2134,
      inStock: true,
      stockCount: 12,
      tags: ['Smartwatch', 'Titanium', 'Action Button', '36h Battery'],
      featured: true,
      onSale: false
    },
    {
      id: '22',
      name: 'Samsung Galaxy Watch 6 Classic',
      description: 'Premium smartwatch with rotating bezel and comprehensive health tracking',
      price: 429,
      originalPrice: 479,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      category: 'Electronics',
      subcategory: 'Wearables',
      brand: 'Samsung',
      rating: 4.6,
      reviewCount: 1876,
      inStock: true,
      stockCount: 20,
      tags: ['Smartwatch', 'Rotating Bezel', 'Health Tracking', 'Premium'],
      featured: false,
      onSale: true,
      discount: 10
    },

    // Tablets
    {
      id: '23',
      name: 'iPad Pro 12.9" M3',
      description: 'Most advanced iPad with M3 chip, Liquid Retina XDR display, and Apple Pencil Pro support',
      price: 1099,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      category: 'Electronics',
      subcategory: 'Tablets',
      brand: 'Apple',
      rating: 4.9,
      reviewCount: 1567,
      inStock: true,
      stockCount: 10,
      tags: ['M3 Chip', 'XDR Display', 'Apple Pencil Pro', 'Professional'],
      featured: true,
      onSale: false
    },
    {
      id: '24',
      name: 'Samsung Galaxy Tab S9 Ultra',
      description: '14.6-inch AMOLED display tablet with S Pen and DeX productivity mode',
      price: 1199,
      originalPrice: 1299,
      image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400',
      category: 'Electronics',
      subcategory: 'Tablets',
      brand: 'Samsung',
      rating: 4.7,
      reviewCount: 892,
      inStock: true,
      stockCount: 8,
      tags: ['14.6-inch', 'AMOLED', 'S Pen', 'DeX Mode'],
      featured: false,
      onSale: true,
      discount: 8
    },

    // Kitchen Appliances
    {
      id: '25',
      name: 'KitchenAid Artisan Stand Mixer',
      description: 'Professional 5-quart stand mixer with 10 speeds and multiple attachments',
      price: 449,
      originalPrice: 499,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'KitchenAid',
      rating: 4.8,
      reviewCount: 2341,
      inStock: true,
      stockCount: 15,
      tags: ['Professional', '5-Quart', '10 Speeds', 'Attachments'],
      featured: true,
      onSale: true,
      discount: 10
    },
    {
      id: '26',
      name: 'Breville Smart Oven Pro',
      description: 'Countertop convection oven with smart presets and precise temperature control',
      price: 299,
      image: 'https://images.unsplash.com/photo-1585515656247-7bfcbcbf5f60?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Breville',
      rating: 4.6,
      reviewCount: 1876,
      inStock: true,
      stockCount: 22,
      tags: ['Convection', 'Smart Presets', 'Countertop', 'Precise Control'],
      featured: false,
      onSale: false
    },
    {
      id: '27',
      name: 'Ninja Foodi Pressure Cooker',
      description: '8-in-1 pressure cooker with air frying, steaming, and slow cooking capabilities',
      price: 199,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1556909114-4b4cbcb36ee6?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Ninja',
      rating: 4.7,
      reviewCount: 3421,
      inStock: true,
      stockCount: 30,
      tags: ['8-in-1', 'Pressure Cooker', 'Air Frying', 'Multi-Functional'],
      featured: true,
      onSale: true,
      discount: 20
    },
    {
      id: '28',
      name: 'Vitamix Professional Blender',
      description: 'High-performance blender with variable speed control and self-cleaning',
      price: 549,
      image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Vitamix',
      rating: 4.9,
      reviewCount: 1543,
      inStock: true,
      stockCount: 12,
      tags: ['High-Performance', 'Variable Speed', 'Self-Cleaning', 'Professional'],
      featured: true,
      onSale: false
    },
    {
      id: '29',
      name: 'Cuisinart Food Processor',
      description: '14-cup food processor with multiple blades and chopping attachments',
      price: 199,
      image: 'https://images.unsplash.com/photo-1574781330855-d0db2ee151ba?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Cuisinart',
      rating: 4.5,
      reviewCount: 2156,
      inStock: true,
      stockCount: 18,
      tags: ['14-Cup', 'Multiple Blades', 'Attachments', 'Versatile'],
      featured: false,
      onSale: false
    },
    {
      id: '30',
      name: 'Keurig K-Supreme Plus Coffee Maker',
      description: 'Smart coffee maker with customizable brew strength and temperature',
      price: 169,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Keurig',
      rating: 4.4,
      reviewCount: 2876,
      inStock: true,
      stockCount: 25,
      tags: ['Smart', 'Customizable', 'Brew Strength', 'Temperature Control'],
      featured: false,
      onSale: true,
      discount: 15
    },
    {
      id: '31',
      name: 'Instant Pot Duo Plus',
      description: '9-in-1 electric pressure cooker with advanced safety features',
      price: 129,
      originalPrice: 159,
      image: 'https://images.unsplash.com/photo-1556909114-2ceed09d13c4?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Instant Pot',
      rating: 4.6,
      reviewCount: 5432,
      inStock: true,
      stockCount: 40,
      tags: ['9-in-1', 'Electric', 'Safety Features', 'Popular'],
      featured: true,
      onSale: true,
      discount: 19
    },
    {
      id: '32',
      name: 'Breville Barista Express',
      description: 'Espresso machine with built-in grinder and milk frother',
      price: 699,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Breville',
      rating: 4.7,
      reviewCount: 1234,
      inStock: true,
      stockCount: 8,
      tags: ['Espresso', 'Built-in Grinder', 'Milk Frother', 'Professional'],
      featured: true,
      onSale: true,
      discount: 13
    },
    {
      id: '33',
      name: 'Dyson V15 Detect Absolute',
      description: 'Cordless vacuum with laser detection and advanced filtration',
      price: 649,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      category: 'Kitchen',
      subcategory: 'Cleaning',
      brand: 'Dyson',
      rating: 4.8,
      reviewCount: 987,
      inStock: true,
      stockCount: 14,
      tags: ['Cordless', 'Laser Detection', 'Advanced Filtration', 'Premium'],
      featured: true,
      onSale: false
    },

    // Living Room Furniture
    {
      id: '34',
      name: 'Modern L-Shaped Sectional Sofa',
      description: 'Comfortable L-shaped sectional with premium fabric and memory foam',
      price: 1299,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
      category: 'Living Room',
      subcategory: 'Seating',
      brand: 'Ashley Furniture',
      rating: 4.5,
      reviewCount: 876,
      inStock: true,
      stockCount: 6,
      tags: ['L-Shaped', 'Premium Fabric', 'Memory Foam', 'Comfortable'],
      featured: true,
      onSale: true,
      discount: 19
    },
    {
      id: '35',
      name: 'Scandinavian Coffee Table',
      description: 'Minimalist oak wood coffee table with storage compartments',
      price: 349,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      category: 'Living Room',
      subcategory: 'Tables',
      brand: 'IKEA',
      rating: 4.3,
      reviewCount: 1543,
      inStock: true,
      stockCount: 20,
      tags: ['Scandinavian', 'Oak Wood', 'Storage', 'Minimalist'],
      featured: false,
      onSale: false
    },
    {
      id: '36',
      name: 'Smart TV Entertainment Center',
      description: '65-inch TV stand with cable management and LED lighting',
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      category: 'Living Room',
      subcategory: 'Storage',
      brand: 'Walker Edison',
      rating: 4.4,
      reviewCount: 2341,
      inStock: true,
      stockCount: 15,
      tags: ['65-inch', 'Cable Management', 'LED Lighting', 'Smart'],
      featured: true,
      onSale: true,
      discount: 25
    },
    {
      id: '37',
      name: 'Ergonomic Recliner Chair',
      description: 'Luxury leather recliner with massage and heating functions',
      price: 899,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400',
      category: 'Living Room',
      subcategory: 'Seating',
      brand: 'La-Z-Boy',
      rating: 4.7,
      reviewCount: 654,
      inStock: true,
      stockCount: 10,
      tags: ['Ergonomic', 'Luxury Leather', 'Massage', 'Heating'],
      featured: true,
      onSale: true,
      discount: 25
    },
    {
      id: '38',
      name: 'Floating Wall Shelves Set',
      description: 'Set of 3 floating shelves with hidden brackets and modern design',
      price: 79,
      originalPrice: 99,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      category: 'Living Room',
      subcategory: 'Storage',
      brand: 'VASAGLE',
      rating: 4.2,
      reviewCount: 3421,
      inStock: true,
      stockCount: 50,
      tags: ['Floating', 'Hidden Brackets', 'Modern Design', 'Set of 3'],
      featured: false,
      onSale: true,
      discount: 20
    },
    {
      id: '39',
      name: 'Velvet Ottoman Storage',
      description: 'Luxury velvet ottoman with hidden storage and gold legs',
      price: 149,
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      category: 'Living Room',
      subcategory: 'Storage',
      brand: 'Nathan James',
      rating: 4.5,
      reviewCount: 876,
      inStock: true,
      stockCount: 25,
      tags: ['Velvet', 'Hidden Storage', 'Gold Legs', 'Luxury'],
      featured: false,
      onSale: false
    },
    {
      id: '40',
      name: 'Floor-to-Ceiling Bookshelf',
      description: '7-tier wooden bookshelf with adjustable shelves',
      price: 199,
      originalPrice: 249,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      category: 'Living Room',
      subcategory: 'Storage',
      brand: 'Prepac',
      rating: 4.3,
      reviewCount: 1876,
      inStock: true,
      stockCount: 18,
      tags: ['7-Tier', 'Wooden', 'Adjustable Shelves', 'Floor-to-Ceiling'],
      featured: false,
      onSale: true,
      discount: 20
    },
    {
      id: '41',
      name: 'Smart Floor Lamp',
      description: 'LED floor lamp with voice control and color changing features',
      price: 129,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      category: 'Living Room',
      subcategory: 'Lighting',
      brand: 'Philips Hue',
      rating: 4.6,
      reviewCount: 1234,
      inStock: true,
      stockCount: 30,
      tags: ['LED', 'Voice Control', 'Color Changing', 'Smart'],
      featured: true,
      onSale: false
    },

    // Sports & Fitness Equipment
    {
      id: '42',
      name: 'Adjustable Dumbbell Set',
      description: 'Space-saving adjustable dumbbells from 5-50 lbs per handle',
      price: 349,
      originalPrice: 449,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      category: 'Sports',
      subcategory: 'Strength Training',
      brand: 'Bowflex',
      rating: 4.7,
      reviewCount: 2345,
      inStock: true,
      stockCount: 12,
      tags: ['Adjustable', '5-50 lbs', 'Space-Saving', 'Professional'],
      featured: true,
      onSale: true,
      discount: 22
    },
    {
      id: '43',
      name: 'Smart Treadmill',
      description: 'Foldable treadmill with interactive display and virtual coaching',
      price: 1299,
      originalPrice: 1599,
      image: 'https://images.unsplash.com/photo-1544966503-7e26e1e5de62?w=400',
      category: 'Sports',
      subcategory: 'Cardio',
      brand: 'NordicTrack',
      rating: 4.5,
      reviewCount: 876,
      inStock: true,
      stockCount: 8,
      tags: ['Foldable', 'Interactive Display', 'Virtual Coaching', 'Smart'],
      featured: true,
      onSale: true,
      discount: 19
    },
    {
      id: '44',
      name: 'Yoga Mat Premium',
      description: 'Eco-friendly TPE yoga mat with alignment lines and carrying strap',
      price: 49,
      originalPrice: 69,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
      category: 'Sports',
      subcategory: 'Yoga & Pilates',
      brand: 'Manduka',
      rating: 4.8,
      reviewCount: 4321,
      inStock: true,
      stockCount: 60,
      tags: ['Eco-Friendly', 'TPE', 'Alignment Lines', 'Carrying Strap'],
      featured: false,
      onSale: true,
      discount: 29
    },
    {
      id: '45',
      name: 'Resistance Bands Set',
      description: 'Complete resistance bands set with door anchor and workout guide',
      price: 29,
      originalPrice: 39,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      category: 'Sports',
      subcategory: 'Strength Training',
      brand: 'Fit Simplify',
      rating: 4.4,
      reviewCount: 8765,
      inStock: true,
      stockCount: 100,
      tags: ['Complete Set', 'Door Anchor', 'Workout Guide', 'Portable'],
      featured: false,
      onSale: true,
      discount: 26
    },
    {
      id: '46',
      name: 'Smart Exercise Bike',
      description: 'Indoor cycling bike with live streaming classes and metrics tracking',
      price: 899,
      originalPrice: 1199,
      image: 'https://images.unsplash.com/photo-1544966503-7e26e1e5de62?w=400',
      category: 'Sports',
      subcategory: 'Cardio',
      brand: 'Peloton',
      rating: 4.6,
      reviewCount: 1234,
      inStock: true,
      stockCount: 15,
      tags: ['Indoor Cycling', 'Live Streaming', 'Metrics Tracking', 'Smart'],
      featured: true,
      onSale: true,
      discount: 25
    },
    {
      id: '47',
      name: 'Olympic Weight Plate Set',
      description: 'Cast iron weight plates set from 2.5 lb to 45 lb',
      price: 299,
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      category: 'Sports',
      subcategory: 'Strength Training',
      brand: 'CAP Barbell',
      rating: 4.3,
      reviewCount: 1876,
      inStock: true,
      stockCount: 20,
      tags: ['Olympic', 'Cast Iron', '2.5-45 lb', 'Professional'],
      featured: false,
      onSale: false
    },
    {
      id: '48',
      name: 'Foam Roller Set',
      description: 'Deep tissue massage foam roller with trigger point balls',
      price: 39,
      originalPrice: 59,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
      category: 'Sports',
      subcategory: 'Recovery',
      brand: 'TriggerPoint',
      rating: 4.7,
      reviewCount: 3456,
      inStock: true,
      stockCount: 45,
      tags: ['Deep Tissue', 'Massage', 'Trigger Point', 'Recovery'],
      featured: false,
      onSale: true,
      discount: 34
    },
    {
      id: '49',
      name: 'Smart Fitness Watch',
      description: 'Advanced fitness tracker with GPS, heart rate, and sleep monitoring',
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      category: 'Sports',
      subcategory: 'Wearables',
      brand: 'Garmin',
      rating: 4.6,
      reviewCount: 2134,
      inStock: true,
      stockCount: 25,
      tags: ['GPS', 'Heart Rate', 'Sleep Monitoring', 'Advanced'],
      featured: true,
      onSale: true,
      discount: 25
    },

    // More Electronics
    {
      id: '50',
      name: 'Wireless Earbuds Pro',
      description: 'Premium wireless earbuds with active noise cancellation',
      price: 249,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
      category: 'Electronics',
      subcategory: 'Audio',
      brand: 'Apple',
      rating: 4.8,
      reviewCount: 5432,
      inStock: true,
      stockCount: 35,
      tags: ['Wireless', 'Active Noise Cancellation', 'Premium', 'Pro'],
      featured: true,
      onSale: true,
      discount: 17
    },

    // Additional Kitchen Appliances
    {
      id: '51',
      name: 'Smart Refrigerator',
      description: '24 cu ft smart refrigerator with touchscreen and Wi-Fi connectivity',
      price: 2299,
      originalPrice: 2699,
      image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Samsung',
      rating: 4.5,
      reviewCount: 876,
      inStock: true,
      stockCount: 5,
      tags: ['24 cu ft', 'Smart', 'Touchscreen', 'Wi-Fi'],
      featured: true,
      onSale: true,
      discount: 15
    },
    {
      id: '52',
      name: 'Induction Cooktop',
      description: 'Portable induction cooktop with precise temperature control',
      price: 149,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
      category: 'Kitchen',
      subcategory: 'Appliances',
      brand: 'Duxtop',
      rating: 4.4,
      reviewCount: 2341,
      inStock: true,
      stockCount: 28,
      tags: ['Portable', 'Induction', 'Precise Control', 'Energy Efficient'],
      featured: false,
      onSale: true,
      discount: 25
    },

    // More Living Room Items
    {
      id: '56',
      name: 'Smart TV 75" OLED',
      description: '75-inch OLED TV with 4K HDR and voice control',
      price: 2299,
      originalPrice: 2799,
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
      category: 'Living Room',
      subcategory: 'Entertainment',
      brand: 'LG',
      rating: 4.7,
      reviewCount: 987,
      inStock: true,
      stockCount: 8,
      tags: ['75-inch', 'OLED', '4K HDR', 'Voice Control'],
      featured: true,
      onSale: true,
      discount: 18
    },
    {
      id: '57',
      name: 'Premium Sound Bar',
      description: 'High-end sound bar with Dolby Atmos and wireless subwoofer',
      price: 599,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
      category: 'Living Room',
      subcategory: 'Entertainment',
      brand: 'Sonos',
      rating: 4.8,
      reviewCount: 1543,
      inStock: true,
      stockCount: 15,
      tags: ['Dolby Atmos', 'Wireless Subwoofer', 'Premium', 'High-End'],
      featured: true,
      onSale: true,
      discount: 25
    },

    // More Sports Equipment
    {
      id: '61',
      name: 'Elliptical Machine',
      description: 'Commercial-grade elliptical with 20 resistance levels',
      price: 1899,
      originalPrice: 2299,
      image: 'https://images.unsplash.com/photo-1544966503-7e26e1e5de62?w=400',
      category: 'Sports',
      subcategory: 'Cardio',
      brand: 'Sole Fitness',
      rating: 4.5,
      reviewCount: 654,
      inStock: true,
      stockCount: 6,
      tags: ['Commercial-Grade', '20 Resistance Levels', 'Elliptical', 'Professional'],
      featured: true,
      onSale: true,
      discount: 17
    },
    {
      id: '62',
      name: 'Premium Yoga Block Set',
      description: 'Cork yoga blocks set with yoga strap and carrying bag',
      price: 39,
      originalPrice: 59,
      image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400',
      category: 'Sports',
      subcategory: 'Yoga & Pilates',
      brand: 'Gaiam',
      rating: 4.7,
      reviewCount: 2345,
      inStock: true,
      stockCount: 40,
      tags: ['Cork', 'Yoga Strap', 'Carrying Bag', 'Premium'],
      featured: false,
      onSale: true,
      discount: 34
    },

    // Additional Electronics
    {
      id: '66',
      name: 'Wireless Gaming Mouse',
      description: 'High-precision gaming mouse with RGB lighting',
      price: 99,
      originalPrice: 129,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400',
      category: 'Electronics',
      subcategory: 'Gaming',
      brand: 'Logitech',
      rating: 4.7,
      reviewCount: 2134,
      inStock: true,
      stockCount: 45,
      tags: ['Wireless', 'High-Precision', 'RGB Lighting', 'Gaming'],
      featured: false,
      onSale: true,
      discount: 23
    },
    {
      id: '67',
      name: 'Mechanical Keyboard RGB',
      description: 'Cherry MX switches mechanical keyboard with RGB backlighting',
      price: 149,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
      category: 'Electronics',
      subcategory: 'Gaming',
      brand: 'Corsair',
      rating: 4.8,
      reviewCount: 1876,
      inStock: true,
      stockCount: 30,
      tags: ['Cherry MX', 'Mechanical', 'RGB Backlighting', 'Gaming'],
      featured: true,
      onSale: true,
      discount: 25
    },
    {
      id: '70',
      name: 'Smart Security Camera',
      description: '4K security camera with night vision and motion detection',
      price: 129,
      originalPrice: 179,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
      category: 'Electronics',
      subcategory: 'Smart Home',
      brand: 'Ring',
      rating: 4.6,
      reviewCount: 1543,
      inStock: true,
      stockCount: 35,
      tags: ['4K', 'Night Vision', 'Motion Detection', 'Security'],
      featured: true,
      onSale: true,
      discount: 28
    }
  ];

  const categories = ['Electronics', 'Kitchen', 'Living Room', 'Sports', 'Gaming', 'Smart Home', 'Audio', 'Cameras'];
  const brands = ['Apple', 'Samsung', 'Sony', 'Google', 'Canon', 'Dell', 'ASUS', 'LG', 'Microsoft', 'Nintendo', 'Fujifilm', 'Amazon', 'Bose', 'KitchenAid', 'Breville', 'Ninja', 'Vitamix', 'Cuisinart', 'Keurig', 'Instant Pot', 'Dyson', 'Ashley Furniture', 'IKEA', 'Walker Edison', 'La-Z-Boy', 'VASAGLE', 'Nathan James', 'Prepac', 'Philips Hue', 'Bowflex', 'NordicTrack', 'Manduka', 'Fit Simplify', 'Peloton', 'CAP Barbell', 'TriggerPoint', 'Garmin', 'Anker', 'Ring', 'Logitech', 'Corsair'];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(sampleProducts);
      setFilteredProducts(sampleProducts);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [searchQuery, sortBy, selectedCategories, selectedBrands, priceRange, products]);

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    setFilteredProducts(filtered);
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addItem({
      productId: product.id,
      quantity: 1
    }));
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const FilterDrawer = () => (
    <Drawer
      anchor="left"
      open={filterDrawerOpen}
      onClose={() => setFilterDrawerOpen(false)}
      sx={{ '& .MuiDrawer-paper': { width: 300, p: 2 } }}
    >
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      {/* Categories */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Categories
      </Typography>
      <List dense>
        {categories.map(category => (
          <ListItem key={category} disablePadding>
            <Checkbox
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            <ListItemText primary={category} />
          </ListItem>
        ))}
      </List>

      {/* Brands */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Brands
      </Typography>
      <List dense>
        {brands.map(brand => (
          <ListItem key={brand} disablePadding>
            <Checkbox
              checked={selectedBrands.includes(brand)}
              onChange={() => handleBrandChange(brand)}
            />
            <ListItemText primary={brand} />
          </ListItem>
        ))}
      </List>

      {/* Price Range */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Price Range
      </Typography>
      <Slider
        value={priceRange}
        onChange={(_, newValue) => setPriceRange(newValue as number[])}
        valueLabelDisplay="auto"
        min={0}
        max={5000}
        sx={{ mx: 2 }}
      />
      <Typography variant="caption" color="text.secondary">
        ${priceRange[0]} - ${priceRange[1]}
      </Typography>

      {/* Clear Filters */}
      <Button
        fullWidth
        variant="outlined"
        sx={{ mt: 3 }}
        onClick={() => {
          setSelectedCategories([]);
          setSelectedBrands([]);
          setPriceRange([0, 1000]);
          setSearchQuery('');
        }}
      >
        Clear All Filters
      </Button>
    </Drawer>
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI-Powered Electronics Store
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover 24+ premium electronics with AI recommendations and smart filtering
        </Typography>
      </Box>

      {/* Search and Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setFilterDrawerOpen(true)}
            >
              Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Active Filters */}
      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Active Filters:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedCategories.map(category => (
              <Chip
                key={category}
                label={category}
                onDelete={() => handleCategoryChange(category)}
                size="small"
              />
            ))}
            {selectedBrands.map(brand => (
              <Chip
                key={brand}
                label={brand}
                onDelete={() => handleBrandChange(brand)}
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Results Count */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Showing {paginatedProducts.length} of {filteredProducts.length} products
      </Typography>

      {/* Loading */}
      {loading && (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      )}

      {/* Products Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {paginatedProducts.map((product) => (
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

                {/* Favorite Button */}
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 1,
                    bgcolor: 'rgba(255,255,255,0.8)',
                  }}
                  onClick={() => toggleFavorite(product.id)}
                >
                  {favorites.includes(product.id) ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>

                <CardMedia
                  component="img"
                  height="200"
                  image={product.image}
                  alt={product.name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${product.id}`)}
                />

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" noWrap sx={{ mb: 1 }}>
                    {product.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {product.brand}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={product.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="caption" sx={{ ml: 1 }}>
                      ({product.reviewCount})
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {product.description.substring(0, 80)}...
                  </Typography>

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

                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                    {product.tags.slice(0, 2).map((tag, index) => (
                      <Chip key={index} label={tag} size="small" variant="outlined" />
                    ))}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CartIcon />}
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <ViewIcon />
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* No Results */}
      {!loading && filteredProducts.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {filteredProducts.length > itemsPerPage && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={Math.ceil(filteredProducts.length / itemsPerPage)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      <FilterDrawer />
    </Box>
  );
};

export default ProductsPage;
