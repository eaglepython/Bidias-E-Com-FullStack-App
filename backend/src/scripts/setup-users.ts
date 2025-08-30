import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';

async function setupUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://admin:password123@mongodb:27017/bidias_ecommerce?authSource=admin');
    console.log('✅ Connected to MongoDB');

    const password = 'Future2025@';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create/Update Admin User
    const adminUser = await User.findOneAndUpdate(
      { email: 'admin@bidias.com' },
      {
        email: 'admin@bidias.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        authProvider: 'local'
      },
      { upsert: true, new: true }
    );

    // Create/Update Regular User
    const regularUser = await User.findOneAndUpdate(
      { email: 'user@bidias.com' },
      {
        email: 'user@bidias.com',
        password: hashedPassword,
        firstName: 'Regular',
        lastName: 'User',
        role: 'customer',
        isActive: true,
        isEmailVerified: true,
        authProvider: 'local'
      },
      { upsert: true, new: true }
    );

    console.log('✅ Admin user created/updated:');
    console.log(`   Email: admin@bidias.com`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: admin`);

    console.log('✅ Regular user created/updated:');
    console.log(`   Email: user@bidias.com`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: customer`);

    console.log('\n🔐 You can now login with these credentials:');
    console.log('Admin: admin@bidias.com / Future2025@');
    console.log('User: user@bidias.com / Future2025@');

  } catch (error) {
    console.error('❌ Error setting up users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the setup
setupUsers();
