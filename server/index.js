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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Connect DB and start server
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rentapp';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log(`🌐 Server running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('⚠️  Starting server without database connection...');
        console.log('💡 To fix this:');
        console.log('   1. Install MongoDB locally');
        console.log('   2. Or use MongoDB Atlas (cloud)');
        console.log('   3. Create a .env file with MONGO_URI');
        console.log(`🌐 Server running on port ${PORT} (NO DATABASE)`);
        console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });

app.listen(PORT, () => {
    // Server is listening, but we'll log connection status above
});
