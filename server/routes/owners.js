import express from 'express';
import Property from '../models/Property.js';
import Tenant from '../models/Tenant.js';
import RentPayment from '../models/RentPayment.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        const properties = await Property.find({}, '_id ownerName');
        const stats = await Promise.all(properties.map(async (property) => {
            const tenantCount = await Tenant.countDocuments({ propertyId: property._id });
            const totalCredited = await RentPayment.aggregate([
                { $match: { propertyId: property._id, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            return {
                ownerName: property.ownerName,
                tenantCount,
                totalCredited: totalCredited[0]?.total || 0
            };
        }));
        res.json({ stats });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch owner stats' });
    }
});

export default router;