import express from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RentPayment from '../models/RentPayment.js';
import Tenant from '../models/Tenant.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// For resolving __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure receipts directory exists
const receiptDir = path.join(__dirname, '../pdf');
if (!fs.existsSync(receiptDir)) {
    fs.mkdirSync(receiptDir);
}

// ✅ GET /api/payments - Get all payments (admin only)
router.get('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const payments = await RentPayment.find()
            .populate('tenantId', 'firstName lastName apartmentNumber')
            .sort({ paymentDate: -1 });

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ GET /api/payments/user - Get user's own payments
router.get('/user', authenticateToken, async (req, res) => {
    try {
        // Find the tenant whose email matches the logged-in user's email
        const userEmail = req.user.email;
        const tenant = await Tenant.findOne({ email: userEmail });
        if (!tenant) {
            return res.status(404).json([]); // No tenant found for this user
        }
        const payments = await RentPayment.find({ tenantId: tenant._id }).sort({ paymentDate: -1 });
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ GET /api/payments/:id - Get single payment (admin only)
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const payment = await RentPayment.findById(req.params.id)
            .populate('tenantId', 'firstName lastName apartmentNumber');

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ POST /api/payments - Add rent payment and generate receipt (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const {
            tenantId,
            amount,
            paymentDate,
            paymentMethod,
            description,
            status = 'paid'
        } = req.body;

        // Validate required fields
        if (!tenantId || !amount || !paymentDate || !paymentMethod) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if tenant exists
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Save payment
        const payment = new RentPayment({
            tenantId,
            amount,
            paymentDate: new Date(paymentDate),
            paymentMethod,
            description,
            status
        });

        const savedPayment = await payment.save();

        // Generate receipt
        const doc = new PDFDocument();
        const receiptName = `${savedPayment.receiptId}.pdf`;
        const receiptPath = path.join(receiptDir, receiptName);
        const writeStream = fs.createWriteStream(receiptPath);
        doc.pipe(writeStream);

        // PDF content
        doc.fontSize(20).text('🏠 Rent Payment Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Receipt No: ${savedPayment.receiptId}`);
        doc.text(`Date: ${new Date(paymentDate).toLocaleDateString()}`);
        doc.text(`Tenant Name: ${tenant.firstName} ${tenant.lastName}`);
        doc.text(`Property: ${tenant.apartmentNumber}`);
        doc.text(`Phone: ${tenant.phone}`);
        doc.text(`Amount Paid: ₹${parseInt(amount).toLocaleString('en-IN')}`);
        doc.text(`Payment Method: ${paymentMethod.replace('_', ' ').toUpperCase()}`);
        if (description) {
            doc.text(`Description: ${description}`);
        }
        doc.end();

        // Send response after PDF is written
        writeStream.on('finish', () => {
            const receiptUrl = `http://localhost:5000/receipts/${receiptName}`;
            res.status(201).json({
                message: 'Payment recorded and receipt generated',
                receiptUrl,
                payment: savedPayment,
            });
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ PUT /api/payments/:id - Update payment (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const updatedPayment = await RentPayment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('tenantId', 'firstName lastName apartmentNumber');

        if (!updatedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json(updatedPayment);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ DELETE /api/payments/:id - Delete payment (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const deletedPayment = await RentPayment.findByIdAndDelete(req.params.id);

        if (!deletedPayment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        res.status(200).json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ✅ GET /api/payments/tenant/:tenantId - Get payments for specific tenant
router.get('/tenant/:tenantId', authenticateToken, isAdmin, async (req, res) => {
    try {
        const payments = await RentPayment.find({ tenantId: req.params.tenantId })
            .populate('tenantId', 'firstName lastName apartmentNumber')
            .sort({ paymentDate: -1 });

        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching tenant payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
