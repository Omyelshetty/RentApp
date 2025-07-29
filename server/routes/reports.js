// server/routes/reports.js
import express from 'express';
import RentPayment from '../models/RentPayment.js';
import Tenant from '../models/Tenant.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ GET /api/reports - Get comprehensive reports (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { range = 'month' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;

        switch (range) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Get all tenants
        const totalTenants = await Tenant.countDocuments();
        const activeTenants = await Tenant.countDocuments({ status: 'active' });
        const inactiveTenants = await Tenant.countDocuments({ status: 'inactive' });
        const pendingTenants = await Tenant.countDocuments({ status: 'pending' });

        // Get payment statistics
        const payments = await RentPayment.find({
            paymentDate: { $gte: startDate, $lte: now }
        }).populate('tenantId', 'firstName lastName apartmentNumber rentAmount');

        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const activePayments = payments.filter(p => p.status === 'paid').length;
        const pendingPayments = payments.filter(p => p.status === 'pending').length;
        const overduePayments = payments.filter(p => p.status === 'overdue').length;

        // Calculate average rent
        const tenantsWithRent = await Tenant.find({ status: 'active' });
        const averageRent = tenantsWithRent.length > 0
            ? tenantsWithRent.reduce((sum, tenant) => sum + tenant.rentAmount, 0) / tenantsWithRent.length
            : 0;

        // Calculate occupancy rate
        const occupancyRate = totalTenants > 0 ? Math.round((activeTenants / totalTenants) * 100) : 0;

        // Monthly revenue data (last 6 months)
        const monthlyPayments = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthPayments = await RentPayment.find({
                paymentDate: { $gte: monthDate, $lte: monthEnd }
            });

            const monthRevenue = monthPayments.reduce((sum, payment) => sum + payment.amount, 0);
            monthlyPayments.push({
                month: monthDate.toLocaleString('default', { month: 'short' }),
                amount: monthRevenue
            });
        }

        // Payment methods distribution
        const paymentMethods = await RentPayment.aggregate([
            { $match: { paymentDate: { $gte: startDate, $lte: now } } },
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ]);

        const paymentMethodsData = {};
        paymentMethods.forEach(method => {
            paymentMethodsData[method._id] = Math.round((method.count / payments.length) * 100);
        });

        // Tenant status distribution
        const tenantStatus = {
            active: activeTenants,
            inactive: inactiveTenants,
            pending: pendingTenants
        };

        res.status(200).json({
            totalRevenue,
            totalTenants,
            activeTenants,
            inactiveTenants,
            pendingTenants,
            activePayments,
            pendingPayments,
            overduePayments,
            averageRent: Math.round(averageRent),
            occupancyRate,
            monthlyPayments,
            tenantStatus,
            paymentMethods: paymentMethodsData
        });

    } catch (error) {
        console.error('Error generating reports:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ GET /api/reports/tenant/:tenantId - Get tenant-specific report
router.get('/tenant/:tenantId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const tenant = await Tenant.findById(req.params.tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const payments = await RentPayment.find({ tenantId: req.params.tenantId })
            .sort({ paymentDate: -1 });

        const totalPaid = payments.filter(p => p.status === 'paid')
            .reduce((sum, payment) => sum + payment.amount, 0);

        const totalPending = payments.filter(p => p.status === 'pending')
            .reduce((sum, payment) => sum + payment.amount, 0);

        const paymentHistory = payments.map(payment => ({
            id: payment._id,
            amount: payment.amount,
            date: payment.paymentDate,
            method: payment.paymentMethod,
            status: payment.status,
            description: payment.description
        }));

        res.status(200).json({
            tenant: {
                id: tenant._id,
                name: `${tenant.firstName} ${tenant.lastName}`,
                apartment: tenant.apartmentNumber,
                rentAmount: tenant.rentAmount,
                status: tenant.status
            },
            totalPaid,
            totalPending,
            paymentHistory,
            totalPayments: payments.length
        });

    } catch (error) {
        console.error('Error generating tenant report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ GET /api/reports/payments - Get detailed payment report
router.get('/payments', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;

        let query = {};

        if (startDate && endDate) {
            query.paymentDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (status) {
            query.status = status;
        }

        const payments = await RentPayment.find(query)
            .populate('tenantId', 'firstName lastName apartmentNumber')
            .sort({ paymentDate: -1 });

        const summary = {
            total: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
            byStatus: {},
            byMethod: {}
        };

        payments.forEach(payment => {
            // Count by status
            summary.byStatus[payment.status] = (summary.byStatus[payment.status] || 0) + 1;

            // Count by method
            summary.byMethod[payment.paymentMethod] = (summary.byMethod[payment.paymentMethod] || 0) + 1;
        });

        res.status(200).json({
            payments,
            summary
        });

    } catch (error) {
        console.error('Error generating payment report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ Recent Activity for Admin Dashboard
router.get('/recent-activity', authenticateToken, isAdmin, async (req, res) => {
    try {
        const recentPayments = await RentPayment.find()
            .populate('tenantId', 'firstName lastName apartmentNumber')
            .sort({ createdAt: -1 })
            .limit(5);
        const recentTenants = await Tenant.find()
            .sort({ createdAt: -1 })
            .limit(5);
        res.status(200).json({ recentPayments, recentTenants });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 