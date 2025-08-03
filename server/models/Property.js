import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
    propertyName: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    ownerEmail: {
        type: String,
        required: true,
        trim: true
    },
    ownerPhone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    totalUnits: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Virtual for formatted property info
propertySchema.virtual('formattedInfo').get(function () {
    return `${this.propertyName} - ${this.ownerName}`;
});

// Ensure virtual fields are serialized
propertySchema.set('toJSON', { virtuals: true });
propertySchema.set('toObject', { virtuals: true });

const Property = mongoose.model('Property', propertySchema);
export default Property; 