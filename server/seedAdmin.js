import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentapp';

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing users
        await User.deleteMany({});
        console.log('🗑️ Cleared existing users');

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const userPassword = await bcrypt.hash('user123', 10);

        // Create admin user
        const adminUser = new User({
            name: 'Admin User',
            email: 'admin@rentapp.com',
            password: adminPassword,
            role: 'admin',
            phone: '+91 9876543210',
            address: 'Admin Address, City, State'
        });

        // Create regular user
        const regularUser = new User({
            name: 'John Doe',
            email: 'user@rentapp.com',
            password: userPassword,
            role: 'user',
            phone: '+91 9876543211',
            address: 'Tenant Address, City, State'
        });

        // Save users
        await adminUser.save();
        await regularUser.save();

        console.log('✅ Database seeded successfully!');
        console.log('📧 Admin Account: admin@rentapp.com / admin123');
        console.log('📧 User Account: user@rentapp.com / user123');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();
