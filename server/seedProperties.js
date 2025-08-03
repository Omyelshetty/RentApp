import mongoose from 'mongoose';
import Property from './models/Property.js';
import 'dotenv/config';

// MongoDB connection (force IPv4 to avoid ECONNREFUSED ::1)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://omyelshetty:OmYelshetty@rentapp.xouzvsv.mongodb.net/RentApp?retryWrites=true&w=majority';

// Debug listeners for connection status
mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

const properties = [
    {
        propertyName: 'Sunrise Apartments',
        ownerName: 'Dilip Dattopant Yelshetty',
        ownerEmail: 'dilip.yelshetty@gmail.com',
        ownerPhone: '+91-9876543210',
        address: '123 Main Street, City Center, Mumbai',
        totalUnits: 20,
        status: 'active'
    },
    {
        propertyName: 'Green Valley Residency',
        ownerName: 'Lata Mohan Yelshetty',
        ownerEmail: 'lata.yelshetty@rentapp.com',
        ownerPhone: '+91-9876543211',
        address: '456 Park Avenue, Suburban Area, Delhi',
        totalUnits: 15,
        status: 'active'
    },
    {
        propertyName: 'Ocean View Towers',
        ownerName: 'Suhas Dattopant Yelshetty',
        ownerEmail: 'suhas.yelshetty@rentapp.com',
        ownerPhone: '+91-9876543212',
        address: '789 Beach Road, Coastal Area, Chennai',
        totalUnits: 25,
        status: 'active'
    },
    {
        propertyName: 'Mountain Heights',
        ownerName: 'Dattatreya Mallikarjun Yelshetty',
        ownerEmail: 'dattatreya.yelshetty@rentapp.com',
        ownerPhone: '+91-9876543213',
        address: '321 Hill Street, Hill Station, Bangalore',
        totalUnits: 12,
        status: 'active'
    }
];

async function seedProperties() {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Clear existing properties
        await Property.deleteMany({});
        console.log('🧹 Cleared existing properties');

        // Insert new properties
        const insertedProperties = await Property.insertMany(properties);
        console.log(`🌱 Seeded ${insertedProperties.length} properties:`);

        insertedProperties.forEach(property => {
            console.log(`- ${property.propertyName} (${property.ownerName})`);
        });

        console.log('✅ Property seeding completed successfully');
    } catch (error) {
        console.error('❌ Error seeding properties:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

seedProperties();
