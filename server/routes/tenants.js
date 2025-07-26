import express from 'express';
import Tenant from '../models/Tenant.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Add new tenant (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { name, houseAddress, phone } = req.body;

        const tenant = new Tenant({ name, houseAddress, phone });
        const savedTenant = await tenant.save();

        res.status(201).json(savedTenant);
    } catch (err) {
        console.error('Error adding tenant:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Get all tenants (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const tenants = await Tenant.find();
        res.status(200).json(tenants);
    } catch (err) {
        console.error('Error fetching tenants:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Update tenant (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const updated = await Tenant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        console.error('Error updating tenant:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Delete tenant (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await Tenant.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Tenant deleted successfully' });
    } catch (err) {
        console.error('Error deleting tenant:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
