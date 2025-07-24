const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const tenantRoutes = require('./routes/tenants');
const paymentRoutes = require('./routes/payments');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/rent-management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/tenants', tenantRoutes);
app.use('/api/payments', paymentRoutes);

// Serve PDFs statically
app.use('/receipts', express.static(path.join(__dirname, 'pdf')));

// Root Endpoint
app.get('/', (req, res) => {
    res.send('🏠 Rent Management Backend Running');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
