import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { User } from '../models/User';

dotenv.config();

const sampleProducts = [
  {
    name: "Premium Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation and premium sound quality. Perfect for music lovers and professionals.",
    shortDescription: "Premium wireless headphones with noise cancellation",
    brand: "AudioTech",
    category: "Electronics",
    subcategory: "Audio",
    tags: ["wireless", "noise-cancellation", "premium", "music"],
    sku: "AT-WH-001",
    price: {
      original: 299.99,
      current: 249.99,
      currency: "USD"
    },
    inventory: {
      stock: 50,
      lowStockThreshold: 10,
      status: "in_stock" as const
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        alt: "Premium Wireless Headphones",
        isPrimary: true
      }
    ],
    specifications: new Map([
      ["frequency_response", "20Hz - 20kHz"],
      ["battery_life", "30 hours"],
      ["weight", "250g"],
      ["connectivity", "Bluetooth 5.0"]
    ]),
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Quick charge - 5 minutes for 2 hours",
      "Premium leather headband"
    ],
    dimensions: {
      length: 18,
      width: 15,
      height: 8,
      weight: 250,
      unit: "cm"
    },
    ratings: {
      average: 4.5,
      count: 128,
      distribution: {
        1: 2,
        2: 4,
        3: 12,
        4: 35,
        5: 75
      }
    },
    reviews: [],
    variants: [],
    seo: {
      title: "Premium Wireless Headphones - AudioTech",
      description: "Experience superior sound quality with our premium wireless headphones featuring active noise cancellation.",
      keywords: ["wireless headphones", "noise cancellation", "premium audio"],
      slug: "premium-wireless-headphones-audiotech"
    },
    isActive: true,
    isFeatured: true,
    isDigital: false,
    shipping: {
      weight: 0.25,
      dimensions: {
        length: 18,
        width: 15,
        height: 8
      },
      freeShipping: true,
      shippingClass: "standard"
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ["headphones", "wireless", "bluetooth", "noise cancellation"],
      visualFeatures: [],
      categoryPrediction: 0.95
    }
  },
  {
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking watch with heart rate monitoring, GPS, and smart notifications. Track your health and stay connected.",
    shortDescription: "Smart fitness watch with health monitoring",
    brand: "FitTech",
    category: "Electronics",
    subcategory: "Wearables",
    tags: ["fitness", "smartwatch", "health", "gps"],
    sku: "FT-SW-002",
    price: {
      original: 199.99,
      current: 179.99,
      currency: "USD"
    },
    inventory: {
      stock: 75,
      lowStockThreshold: 15,
      status: "in_stock" as const
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500",
        alt: "Smart Fitness Watch",
        isPrimary: true
      }
    ],
    specifications: new Map([
      ["display", "1.4 inch AMOLED"],
      ["battery_life", "7 days"],
      ["water_resistance", "50m"],
      ["sensors", "Heart rate, GPS, Accelerometer"]
    ]),
    features: [
      "24/7 Heart Rate Monitoring",
      "Built-in GPS",
      "Sleep Tracking",
      "50+ Exercise Modes"
    ],
    dimensions: {
      length: 4.5,
      width: 4.5,
      height: 1.2,
      weight: 45,
      unit: "cm"
    },
    ratings: {
      average: 4.3,
      count: 89,
      distribution: {
        1: 1,
        2: 3,
        3: 10,
        4: 25,
        5: 50
      }
    },
    reviews: [],
    variants: [],
    seo: {
      title: "Smart Fitness Watch - FitTech",
      description: "Track your fitness goals with our advanced smartwatch featuring GPS and health monitoring.",
      keywords: ["fitness watch", "smartwatch", "health tracking", "gps"],
      slug: "smart-fitness-watch-fittech"
    },
    isActive: true,
    isFeatured: true,
    isDigital: false,
    shipping: {
      weight: 0.045,
      dimensions: {
        length: 4.5,
        width: 4.5,
        height: 1.2
      },
      freeShipping: true,
      shippingClass: "small"
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ["smartwatch", "fitness", "health", "gps", "wearable"],
      visualFeatures: [],
      categoryPrediction: 0.92
    }
  },
  {
    name: "Professional Camera Lens",
    description: "High-performance camera lens for professional photography. Features premium optics and weather sealing for outdoor shoots.",
    shortDescription: "Professional camera lens with premium optics",
    brand: "OpticsPro",
    category: "Electronics",
    subcategory: "Photography",
    tags: ["camera", "lens", "professional", "photography"],
    sku: "OP-CL-003",
    price: {
      original: 899.99,
      current: 799.99,
      currency: "USD"
    },
    inventory: {
      stock: 25,
      lowStockThreshold: 5,
      status: "in_stock" as const
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=500",
        alt: "Professional Camera Lens",
        isPrimary: true
      }
    ],
    specifications: new Map([
      ["focal_length", "24-70mm"],
      ["aperture", "f/2.8"],
      ["mount", "Canon EF"],
      ["weight", "805g"]
    ]),
    features: [
      "Weather Sealed Construction",
      "Image Stabilization",
      "Ultra-low Dispersion Glass",
      "Professional Build Quality"
    ],
    dimensions: {
      length: 11.3,
      width: 8.8,
      height: 8.8,
      weight: 805,
      unit: "cm"
    },
    ratings: {
      average: 4.8,
      count: 45,
      distribution: {
        1: 0,
        2: 0,
        3: 2,
        4: 8,
        5: 35
      }
    },
    reviews: [],
    variants: [],
    seo: {
      title: "Professional Camera Lens 24-70mm f/2.8 - OpticsPro",
      description: "Capture stunning photos with our professional camera lens featuring premium optics and weather sealing.",
      keywords: ["camera lens", "professional photography", "24-70mm", "canon"],
      slug: "professional-camera-lens-opticspro"
    },
    isActive: true,
    isFeatured: false,
    isDigital: false,
    shipping: {
      weight: 0.805,
      dimensions: {
        length: 11.3,
        width: 8.8,
        height: 8.8
      },
      freeShipping: true,
      shippingClass: "fragile"
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ["camera lens", "photography", "professional", "canon", "optics"],
      visualFeatures: [],
      categoryPrediction: 0.98
    }
  },
  {
    name: "Gaming Mechanical Keyboard",
    description: "High-performance mechanical keyboard designed for gaming with RGB lighting and programmable keys.",
    shortDescription: "Gaming mechanical keyboard with RGB lighting",
    brand: "GameTech",
    category: "Electronics",
    subcategory: "Gaming",
    tags: ["gaming", "keyboard", "mechanical", "rgb"],
    sku: "GT-KB-004",
    price: {
      original: 149.99,
      current: 129.99,
      currency: "USD"
    },
    inventory: {
      stock: 40,
      lowStockThreshold: 8,
      status: "in_stock" as const
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500",
        alt: "Gaming Mechanical Keyboard",
        isPrimary: true
      }
    ],
    specifications: new Map([
      ["switch_type", "Cherry MX Blue"],
      ["backlight", "RGB"],
      ["connectivity", "USB-C"],
      ["layout", "Full Size"]
    ]),
    features: [
      "Cherry MX Blue Switches",
      "Customizable RGB Lighting",
      "Programmable Macros",
      "Anti-Ghosting Technology"
    ],
    dimensions: {
      length: 44,
      width: 13,
      height: 3.5,
      weight: 1200,
      unit: "cm"
    },
    ratings: {
      average: 4.4,
      count: 67,
      distribution: {
        1: 0,
        2: 2,
        3: 5,
        4: 20,
        5: 40
      }
    },
    reviews: [],
    variants: [],
    seo: {
      title: "Gaming Mechanical Keyboard RGB - GameTech",
      description: "Enhance your gaming experience with our mechanical keyboard featuring RGB lighting and programmable keys.",
      keywords: ["gaming keyboard", "mechanical keyboard", "rgb lighting", "cherry mx"],
      slug: "gaming-mechanical-keyboard-gametech"
    },
    isActive: true,
    isFeatured: true,
    isDigital: false,
    shipping: {
      weight: 1.2,
      dimensions: {
        length: 44,
        width: 13,
        height: 3.5
      },
      freeShipping: true,
      shippingClass: "standard"
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ["gaming keyboard", "mechanical", "rgb", "gaming"],
      visualFeatures: [],
      categoryPrediction: 0.93
    }
  },
  {
    name: "Wireless Phone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.",
    shortDescription: "Fast wireless charging pad for smartphones",
    brand: "ChargeTech",
    category: "Electronics",
    subcategory: "Accessories",
    tags: ["wireless", "charger", "smartphone", "qi"],
    sku: "CT-WC-005",
    price: {
      original: 49.99,
      current: 39.99,
      currency: "USD"
    },
    inventory: {
      stock: 100,
      lowStockThreshold: 20,
      status: "in_stock" as const
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1609592643796-67e6ba3b3a2c?w=500",
        alt: "Wireless Phone Charger",
        isPrimary: true
      }
    ],
    specifications: new Map([
      ["power_output", "15W"],
      ["compatibility", "Qi-enabled devices"],
      ["input", "USB-C"],
      ["material", "Aluminum and Glass"]
    ]),
    features: [
      "15W Fast Charging",
      "Qi Certified",
      "LED Charging Indicator",
      "Overheating Protection"
    ],
    dimensions: {
      length: 10,
      width: 10,
      height: 1,
      weight: 150,
      unit: "cm"
    },
    ratings: {
      average: 4.2,
      count: 156,
      distribution: {
        1: 2,
        2: 4,
        3: 20,
        4: 45,
        5: 85
      }
    },
    reviews: [],
    variants: [],
    seo: {
      title: "Fast Wireless Phone Charger 15W - ChargeTech",
      description: "Charge your phone wirelessly with our fast 15W charging pad compatible with all Qi devices.",
      keywords: ["wireless charger", "fast charging", "qi charger", "phone charger"],
      slug: "wireless-phone-charger-chargetech"
    },
    isActive: true,
    isFeatured: false,
    isDigital: false,
    shipping: {
      weight: 0.15,
      dimensions: {
        length: 10,
        width: 10,
        height: 1
      },
      freeShipping: false,
      shippingClass: "small"
    },
    aiMetadata: {
      similarProducts: [],
      recommendations: [],
      searchKeywords: ["wireless charger", "qi charging", "phone accessories"],
      visualFeatures: [],
      categoryPrediction: 0.89
    }
  }
];

const sampleCategories = [
  {
    name: "Electronics",
    description: "Electronic devices and gadgets",
    slug: "electronics",
    isActive: true,
    sortOrder: 1,
    seo: {
      title: "Electronics - Shop Latest Gadgets",
      description: "Discover the latest electronics and gadgets including headphones, smartwatches, cameras and more.",
      keywords: ["electronics", "gadgets", "technology", "devices"]
    },
    subcategories: [
      { name: "Audio", slug: "audio" },
      { name: "Wearables", slug: "wearables" },
      { name: "Photography", slug: "photography" },
      { name: "Gaming", slug: "gaming" },
      { name: "Accessories", slug: "accessories" }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce-db';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Product.deleteMany({});
    await Category.deleteMany({});
    // Don't clear users to preserve existing accounts
    console.log('✅ Existing data cleared');

    // Create a vendor user first
    console.log('👤 Creating vendor user...');
    let vendor = await User.findOne({ email: 'vendor@ecommerce.com' });
    if (!vendor) {
      vendor = new User({
        firstName: 'Store',
        lastName: 'Admin',
        email: 'vendor@ecommerce.com',
        password: 'hashedpassword123', // This would be properly hashed in real scenario
        role: 'vendor',
        isVerified: true,
        profile: {
          phone: '+1234567890',
          dateOfBirth: new Date('1990-01-01'),
          gender: 'other'
        }
      });
      await vendor.save();
      console.log('✅ Created vendor user');
    } else {
      console.log('✅ Vendor user already exists');
    }

    // Seed categories
    console.log('📁 Seeding categories...');
    for (const categoryData of sampleCategories) {
      const category = new Category(categoryData);
      await category.save();
      console.log(`✅ Created category: ${category.name}`);
    }

    // Seed products with vendor ID
    console.log('📦 Seeding products...');
    for (const productData of sampleProducts) {
      const product = new Product({
        ...productData,
        vendor: vendor._id
      });
      await product.save();
      console.log(`✅ Created product: ${product.name}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Created ${sampleCategories.length} categories and ${sampleProducts.length} products`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

export { seedDatabase };
