const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    houseAddress: { type: String, required: true },
    joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema); 