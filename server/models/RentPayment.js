// models/RentPayment.js
import mongoose from 'mongoose';

const rentPaymentSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['Cash', 'PhonePe', 'Razorpay', 'Other'],
        required: true,
    },
    paymentDate: {
        type: Date,
        default: Date.now,
    },
    receiptId: {
        type: String,
        unique: true,
    },
});

rentPaymentSchema.pre('save', function (next) {
    if (!this.receiptId) {
        const timestamp = Date.now();
        this.receiptId = `RENT-${timestamp}`;
    }
    next();
});

const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);
export default RentPayment;
