import mongoose from 'mongoose';
import { Product } from '../models/Product';

const sampleProducts = [
  {
    name: 'Apple iPhone 15 Pro',
    description: 'Latest Apple flagship smartphone with A17 chip.',
    shortDescription: 'Flagship iPhone with A17 chip.',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'Mobile Phones',
    tags: ['apple', 'iphone', 'smartphone', 'ios'],
    sku: 'IP15PRO-001',
    price: {
      original: 1299,
      current: 1199,
      currency: 'USD',
    },
    inventory: {
      stock: 20,
      lowStockThreshold: 5,
      status: 'in_stock',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        alt: 'Apple iPhone 15 Pro',
        isPrimary: true,
      }
    ],
    specifications: {
      color: 'Silver',
      storage: '256GB',
      display: '6.1-inch OLED',
    },
    features: ['A17 Bionic', 'Pro Camera', '5G', 'Face ID'],
    dimensions: {
      weight: 200,
      length: 14.7,
      width: 7.1,
      height: 0.8,
      unit: 'cm',
    },
    ratings: {
      average: 4.8,
      count: 12,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 9 },
    },
    reviews: [],
    variants: [],
    seo: {
      title: 'Apple iPhone 15 Pro',
      description: 'Latest Apple flagship smartphone with A17 chip.',
      keywords: ['apple', 'iphone', 'smartphone'],
      slug: 'apple-iphone-15-pro',
    },
    vendor: null,
    isActive: true,
    isFeatured: true,
    isDigital: false,
    shipping: {
      weight: 200,
      dimensions: { length: 14.7, width: 7.1, height: 0.8 },
      freeShipping: true,
      shippingClass: 'standard',
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ['apple', 'iphone', 'pro'],
      visualFeatures: [],
      categoryPrediction: 1,
    },
    analytics: {
      views: 0,
      clicks: 0,
      purchases: 0,
      wishlistAdds: 0,
      cartAdds: 0,
      conversionRate: 0,
    },
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Premium Android phone with top-tier camera.',
    shortDescription: 'Flagship Samsung Android phone.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Mobile Phones',
    tags: ['samsung', 'galaxy', 'android', 'smartphone'],
    sku: 'SGS24U-001',
    price: {
      original: 1199,
      current: 1099,
      currency: 'USD',
    },
    inventory: {
      stock: 15,
      lowStockThreshold: 5,
      status: 'in_stock',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        alt: 'Samsung Galaxy S24 Ultra',
        isPrimary: true,
      }
    ],
    specifications: {
      color: 'Black',
      storage: '512GB',
      display: '6.8-inch AMOLED',
    },
    features: ['200MP Camera', 'S Pen', '5G', '120Hz Display'],
    dimensions: {
      weight: 220,
      length: 16.5,
      width: 7.8,
      height: 0.9,
      unit: 'cm',
    },
    ratings: {
      average: 4.7,
      count: 8,
      distribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 5 },
    },
    reviews: [],
    variants: [],
    seo: {
      title: 'Samsung Galaxy S24 Ultra',
      description: 'Premium Android phone with top-tier camera.',
      keywords: ['samsung', 'galaxy', 'android'],
      slug: 'samsung-galaxy-s24-ultra',
    },
    vendor: null,
    isActive: true,
    isFeatured: true,
    isDigital: false,
    shipping: {
      weight: 220,
      dimensions: { length: 16.5, width: 7.8, height: 0.9 },
      freeShipping: true,
      shippingClass: 'standard',
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ['samsung', 'galaxy', 'ultra'],
      visualFeatures: [],
      categoryPrediction: 1,
    },
    analytics: {
      views: 0,
      clicks: 0,
      purchases: 0,
      wishlistAdds: 0,
      cartAdds: 0,
      conversionRate: 0,
    },
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancelling headphones.',
    shortDescription: 'Premium noise cancelling headphones.',
    brand: 'Sony',
    category: 'Headphones',
    subcategory: 'Over-Ear',
    tags: ['sony', 'headphones', 'audio', 'wireless'],
    sku: 'SONYWH1000XM5-001',
    price: {
      original: 449,
      current: 399,
      currency: 'USD',
    },
    inventory: {
      stock: 30,
      lowStockThreshold: 5,
      status: 'in_stock',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        alt: 'Sony WH-1000XM5',
        isPrimary: true,
      }
    ],
    specifications: {
      color: 'Black',
      battery: '30h',
      noiseCancelling: true,
    },
    features: ['Noise Cancelling', 'Wireless', '30h Battery', 'Touch Controls'],
    dimensions: {
      weight: 250,
      length: 18,
      width: 15,
      height: 8,
      unit: 'cm',
    },
    ratings: {
      average: 4.9,
      count: 20,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 18 },
    },
    reviews: [],
    variants: [],
    seo: {
      title: 'Sony WH-1000XM5',
      description: 'Industry-leading noise cancelling headphones.',
      keywords: ['sony', 'headphones', 'wireless'],
      slug: 'sony-wh-1000xm5',
    },
    vendor: null,
    isActive: true,
    isFeatured: false,
    isDigital: false,
    shipping: {
      weight: 250,
      dimensions: { length: 18, width: 15, height: 8 },
      freeShipping: true,
      shippingClass: 'standard',
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ['sony', 'headphones', 'xm5'],
      visualFeatures: [],
      categoryPrediction: 2,
    },
    analytics: {
      views: 0,
      clicks: 0,
      purchases: 0,
      wishlistAdds: 0,
      cartAdds: 0,
      conversionRate: 0,
    },
  },
  {
    name: 'Dell XPS 13',
    description: 'Ultra-portable laptop with InfinityEdge display.',
    shortDescription: 'Premium ultrabook laptop.',
    brand: 'Dell',
    category: 'Laptops',
    subcategory: 'Ultrabooks',
    tags: ['dell', 'laptop', 'ultrabook', 'windows'],
    sku: 'DELLXPS13-001',
    price: {
      original: 1499,
      current: 1399,
      currency: 'USD',
    },
    inventory: {
      stock: 10,
      lowStockThreshold: 3,
      status: 'in_stock',
    },
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        alt: 'Dell XPS 13',
        isPrimary: true,
      }
    ],
    specifications: {
      color: 'Silver',
      ram: '16GB',
      storage: '512GB SSD',
      display: '13.4-inch FHD+',
    },
    features: ['InfinityEdge', 'Lightweight', 'Long Battery'],
    dimensions: {
      weight: 1200,
      length: 30,
      width: 20,
      height: 1.5,
      unit: 'cm',
    },
    ratings: {
      average: 4.6,
      count: 5,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 3 },
    },
    reviews: [],
    variants: [],
    seo: {
      title: 'Dell XPS 13',
      description: 'Ultra-portable laptop with InfinityEdge display.',
      keywords: ['dell', 'xps', 'laptop'],
      slug: 'dell-xps-13',
    },
    vendor: null,
    isActive: true,
    isFeatured: false,
    isDigital: false,
    shipping: {
      weight: 1200,
      dimensions: { length: 30, width: 20, height: 1.5 },
      freeShipping: true,
      shippingClass: 'standard',
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ['dell', 'xps', 'ultrabook'],
      visualFeatures: [],
      categoryPrediction: 3,
    },
    analytics: {
      views: 0,
      clicks: 0,
      purchases: 0,
      wishlistAdds: 0,
      cartAdds: 0,
      conversionRate: 0,
    },
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('✅ Sample products seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedProducts();
