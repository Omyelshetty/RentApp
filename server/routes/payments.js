const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const RentPayment = require('../models/RentPayment');
const Tenant = require('../models/Tenant');

// POST /api/payments - Add rent payment and generate receipt
router.post('/', async (req, res) => {
    try {
        const { tenantId, amount, month, paymentMethod } = req.body;

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // Save payment
        const payment = new RentPayment({
            tenantId,
            amount,
            month,
            paymentMethod,
            date: new Date()
        });

        const savedPayment = await payment.save();

        // Generate receipt
        const doc = new PDFDocument();
        const receiptName = `RECEIPT-${tenant.name}-${month}-${Date.now()}.pdf`.replace(/\s+/g, '_');
        const receiptPath = path.join(__dirname, '../pdf', receiptName);
        const writeStream = fs.createWriteStream(receiptPath);
        doc.pipe(writeStream);

        // PDF content
        doc.fontSize(20).text('🏠 Rent Payment Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Receipt No: ${savedPayment._id}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text(`Tenant Name: ${tenant.name}`);
        doc.text(`House Address: ${tenant.houseAddress}`);
        doc.text(`Phone: ${tenant.phone}`);
        doc.text(`Payment Month: ${month}`);
        doc.text(`Amount Paid: ₹${amount}`);
        doc.text(`Payment Method: ${paymentMethod}`);
        doc.end();

        writeStream.on('finish', () => {
            const receiptUrl = `http://localhost:5000/receipts/${receiptName}`;
            res.status(201).json({
                message: 'Payment recorded and receipt generated',
                receiptUrl,
                payment: savedPayment
            });
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
