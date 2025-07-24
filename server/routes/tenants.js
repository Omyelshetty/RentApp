const express = require('express');
const router = express.Router();
const Tenant = require('../models/Tenant');

// Get all tenants
router.get('/', async (req, res) => {
    try {
        const tenants = await Tenant.find();
        res.json(tenants);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new tenant
router.post('/', async (req, res) => {
    try {
        const tenant = new Tenant(req.body);
        await tenant.save();
        res.status(201).json(tenant);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router; 