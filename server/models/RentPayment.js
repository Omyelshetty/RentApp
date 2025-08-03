// models/RentPayment.js
import mongoose from 'mongoose';

const rentPaymentSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'bank_transfer', 'check', 'pending', 'razorpay', 'upi'],
        required: true,
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['paid', 'pending', 'overdue', 'partial'],
        default: 'paid'
    },
    description: {
        type: String,
        trim: true
    },
    receiptId: {
        type: String,
        unique: true,
    },
    month: {
        type: String,
        trim: true
    },
    year: {
        type: Number
    }
}, {
    timestamps: true
});

rentPaymentSchema.pre('save', function (next) {
    if (!this.receiptId) {
        const timestamp = Date.now();
        this.receiptId = `RENT-${timestamp}`;
    }

    // Set month and year if not provided
    if (!this.month || !this.year) {
        const date = new Date(this.paymentDate);
        this.month = date.toLocaleString('default', { month: 'long' });
        this.year = date.getFullYear();
    }

    next();
});

// Virtual for formatted payment date
rentPaymentSchema.virtual('formattedPaymentDate').get(function () {
    return this.paymentDate.toLocaleDateString();
});

// Virtual for formatted amount
rentPaymentSchema.virtual('formattedAmount').get(function () {
    return `$${this.amount.toLocaleString()}`;
});

// Ensure virtual fields are serialized
rentPaymentSchema.set('toJSON', { virtuals: true });
rentPaymentSchema.set('toObject', { virtuals: true });

const RentPayment = mongoose.model('RentPayment', rentPaymentSchema);
export default RentPayment;
