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

// ✅ POST /api/payments - Add rent payment and generate receipt (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { tenantId, amount, month, paymentMethod } = req.body;

        // Check if tenant exists
        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Optional: Check if payment already made for the month
        const existingPayment = await RentPayment.findOne({ tenantId, month });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already recorded for this month.' });
        }

        // Save payment
        const payment = new RentPayment({
            tenantId,
            amount,
            paymentMode: paymentMethod,
            paymentDate: new Date(),
            month
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
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Tenant Name: ${tenant.name}`);
        doc.text(`House Address: ${tenant.houseAddress}`);
        doc.text(`Phone: ${tenant.phone}`);
        doc.text(`Payment Month: ${month}`);
        doc.text(`Amount Paid: ₹${amount}`);
        doc.text(`Payment Method: ${paymentMethod}`);
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

export default router;
