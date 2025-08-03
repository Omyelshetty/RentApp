import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentapp';

async function fixIndexes() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get the Tenant collection
        const tenantCollection = mongoose.connection.collection('tenants');

        // Get all indexes
        const indexes = await tenantCollection.indexes();
        console.log('Current indexes:', indexes);

        // Check for problematic indexes
        const problematicIndexes = indexes.filter(index =>
            index.key && (
                index.key['documents.idProof'] ||
                index.key['aadhaarNumber'] ||
                index.key['aadharNumber']
            )
        );

        if (problematicIndexes.length > 0) {
            console.log('⚠️ Found problematic indexes:', problematicIndexes);
            console.log('Dropping problematic indexes...');

            for (const index of problematicIndexes) {
                try {
                    await tenantCollection.dropIndex(index.name);
                    console.log(`✅ Dropped index: ${index.name}`);
                } catch (dropError) {
                    console.log(`Could not drop index ${index.name}:`, dropError.message);
                }
            }
        } else {
            console.log('✅ No problematic indexes found');
        }

        // Recreate the proper indexes
        console.log('Creating proper indexes...');

        // Create unique index on email
        await tenantCollection.createIndex({ email: 1 }, { unique: true });
        console.log('✅ Created unique index on email');

        // Create unique index on apartmentNumber
        await tenantCollection.createIndex({ apartmentNumber: 1 }, { unique: true });
        console.log('✅ Created unique index on apartmentNumber');

        console.log('✅ Index fix completed successfully!');

    } catch (error) {
        console.error('❌ Error fixing indexes:', error);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run the fix
fixIndexes(); 