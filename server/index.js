import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import tenantRoutes from './routes/tenants.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import reportsRoutes from './routes/reports.js';
import ownersRoutes from './routes/owners.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/owners', ownersRoutes);

// Serve PDF receipts
app.use('/receipts', express.static('./pdf'));

// Connect DB and start server
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Fail fast if can't connect
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err.message);
        console.log('⚠️  Starting server without database connection for testing...');
        console.log('📋 Please fix MongoDB Atlas IP whitelist:');
        console.log('   1. Go to https://cloud.mongodb.com/');
        console.log('   2. Network Access → Add IP Address');
        console.log('   3. Add: 54.197.218.84 or 0.0.0.0/0');
        app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (⚠️  NO DATABASE)`));
    });
