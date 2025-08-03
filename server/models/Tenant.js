// models/Tenant.js
import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    apartmentNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    rentAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    documents: {
        idProof: {
            type: String,
            trim: true,
            required: false,
            default: '',
            sparse: true
        }
    }
}, {
    timestamps: true
});

// Virtual for full name
tenantSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted rent amount in INR
tenantSchema.virtual('formattedRentAmount').get(function () {
    return `₹${this.rentAmount.toLocaleString('en-IN')}`;
});

// Ensure virtual fields are serialized
tenantSchema.set('toJSON', { virtuals: true });
tenantSchema.set('toObject', { virtuals: true });

const Tenant = mongoose.model('Tenant', tenantSchema);
export default Tenant;
