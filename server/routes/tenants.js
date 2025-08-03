import express from 'express';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose'; // Added for database connection check

const router = express.Router();

// ✅ Add new tenant (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            console.error('Database not connected. ReadyState:', mongoose.connection.readyState);
            return res.status(503).json({
                message: 'Database connection unavailable. Please try again in a few moments.'
            });
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            apartmentNumber,
            rentAmount,
            propertyId,
            documents,
            status = 'active'
        } = req.body;

        console.log('Received tenant data:', req.body);

        // Validate required fields
        if (!firstName || !lastName || !email || !apartmentNumber || !rentAmount || !propertyId) {
            console.log('Missing required fields:', {
                firstName: !!firstName,
                lastName: !!lastName,
                email: !!email,
                apartmentNumber: !!apartmentNumber,
                rentAmount: !!rentAmount,
                propertyId: !!propertyId
            });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate rent amount is a positive number
        const rentAmountNum = parseFloat(rentAmount);
        if (isNaN(rentAmountNum) || rentAmountNum <= 0) {
            console.log('Invalid rent amount:', rentAmount);
            return res.status(400).json({ message: 'Rent amount must be a valid positive number' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate documents field if provided
        if (documents && typeof documents === 'object') {
            if (documents.idProof && documents.idProof.trim() === '') {
                documents.idProof = '';
            }
        }

        // Check if tenant already exists with same email or apartment
        const existingTenant = await Tenant.findOne({
            $or: [
                { email: email.toLowerCase() },
                { apartmentNumber: apartmentNumber }
            ]
        });

        if (existingTenant) {
            console.log('Tenant already exists:', existingTenant.email, existingTenant.apartmentNumber);
            return res.status(400).json({ message: 'Tenant with this email or apartment number already exists' });
        }

        const tenant = new Tenant({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            apartmentNumber: apartmentNumber.trim(),
            rentAmount: rentAmountNum,
            propertyId,
            documents: {
                idProof: documents?.idProof?.trim() || ''
            },
            status
        });

        const savedTenant = await tenant.save();
        console.log('Tenant saved successfully:', savedTenant._id);

        res.status(201).json(savedTenant);
    } catch (err) {
        console.error('Error adding tenant:', err);
        console.error('Request body:', req.body);

        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', details: errors });
        }

        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field} already exists` });
        }

        // Handle database connection errors
        if (err.name === 'MongooseServerSelectionError' || err.name === 'MongoNetworkError') {
            return res.status(503).json({
                message: 'Database connection error. Please try again in a few moments.'
            });
        }

        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// ✅ Get all tenants (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({ createdAt: -1 });
        res.status(200).json(tenants);
    } catch (err) {
        console.error('Error fetching tenants:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Get single tenant (admin only)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    } catch (err) {
        console.error('Error fetching tenant:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Update tenant (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        console.log('Updating tenant with data:', req.body);

        // If rent amount is being updated, validate it
        if (req.body.rentAmount !== undefined) {
            const rentAmountNum = parseFloat(req.body.rentAmount);
            if (isNaN(rentAmountNum) || rentAmountNum <= 0) {
                console.log('Invalid rent amount in update:', req.body.rentAmount);
                return res.status(400).json({ message: 'Rent amount must be a valid positive number' });
            }
            req.body.rentAmount = rentAmountNum;
        }

        // Normalize email if being updated
        if (req.body.email) {
            req.body.email = req.body.email.toLowerCase().trim();
        }

        // Trim string fields if being updated
        ['firstName', 'lastName', 'phone', 'apartmentNumber'].forEach(field => {
            if (req.body[field]) {
                req.body[field] = req.body[field].trim();
            }
        });

        const updated = await Tenant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        console.log('Tenant updated successfully:', updated._id);
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating tenant:', err);

        // Handle Mongoose validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(e => e.message);
            return res.status(400).json({ message: 'Validation error', details: errors });
        }

        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json({ message: `${field} already exists` });
        }

        res.status(500).json({ message: 'Server error', details: err.message });
    }
});

// ✅ Delete tenant (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const deleted = await Tenant.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        // Cascade delete: also delete user with same email
        await User.findOneAndDelete({ email: deleted.email });
        res.status(200).json({ message: 'Tenant and user deleted successfully' });
    } catch (err) {
        console.error('Error deleting tenant:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Get tenant for logged-in user
router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email;
        const tenant = await Tenant.findOne({ email: userEmail });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(tenant);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
