import express from 'express';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Add new tenant (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            apartmentNumber,
            rentAmount,
            propertyId,
            emergencyContact,
            documents,
            status = 'active'
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !apartmentNumber || !rentAmount || !propertyId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if tenant already exists with same email or apartment
        const existingTenant = await Tenant.findOne({
            $or: [
                { email: email },
                { apartmentNumber: apartmentNumber }
            ]
        });

        if (existingTenant) {
            return res.status(400).json({ message: 'Tenant with this email or apartment number already exists' });
        }

        const tenant = new Tenant({
            firstName,
            lastName,
            email,
            phone,
            apartmentNumber,
            rentAmount,
            propertyId,
            emergencyContact,
            documents,
            status
        });

        const savedTenant = await tenant.save();

        res.status(201).json(savedTenant);
    } catch (err) {
        console.error('Error adding tenant:', err);
        console.error('Request body:', req.body);
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
        const updated = await Tenant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating tenant:', err);
        res.status(500).json({ message: 'Server error' });
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
