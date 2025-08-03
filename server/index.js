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
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Connect DB and start server with retry logic
const connectWithRetry = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            console.log(`Attempting to connect to MongoDB (attempt ${retries + 1}/${maxRetries})...`);

            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000
            });

            console.log('✅ MongoDB connected successfully!');
            console.log(`🚀 Server running on port ${PORT}`);

            // Start the server only after successful DB connection
            app.listen(PORT, () => {
                console.log(`📡 API available at http://localhost:${PORT}`);
                console.log(`🏥 Health check: http://localhost:${PORT}/health`);
            });

            return;
        } catch (err) {
            retries++;
            console.error(`❌ Connection attempt ${retries} failed:`, err.message);

            if (retries >= maxRetries) {
                console.error('❌ Max retries reached. Starting server without database...');
                console.log('⚠️  Some features may not work without database connection');

                // Start server anyway for testing
                app.listen(PORT, () => {
                    console.log(`🚀 Server running on port ${PORT} (NO DATABASE)`);
                    console.log(`📡 API available at http://localhost:${PORT}`);
                    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
                });
                return;
            }

            // Wait before retrying
            console.log(`⏳ Retrying in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
};

// Handle database connection events
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB');
});

// Start the application
connectWithRetry();
