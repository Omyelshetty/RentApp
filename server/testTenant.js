import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tenant from './models/Tenant.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentapp';

async function testTenantCreation() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test data
        const testTenant = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phone: '1234567890',
            apartmentNumber: 'TEST001',
            rentAmount: 5000,
            propertyId: new mongoose.Types.ObjectId(), // Create a dummy ObjectId
            documents: {
                idProof: 'TEST123456'
            }
        };

        console.log('Testing tenant creation with data:', testTenant);

        // Try to create a tenant
        const tenant = new Tenant(testTenant);
        const savedTenant = await tenant.save();

        console.log('✅ Tenant created successfully:', savedTenant._id);

        // Clean up - delete the test tenant
        await Tenant.findByIdAndDelete(savedTenant._id);
        console.log('✅ Test tenant cleaned up');

        console.log('✅ Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 11000) {
            console.error('Duplicate key error. Field:', Object.keys(error.keyPattern)[0]);
        }
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run the test
testTenantCreation(); 