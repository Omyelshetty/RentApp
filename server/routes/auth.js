import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import Property from '../models/Property.js';
import RentPayment from '../models/RentPayment.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { authenticateToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

// ---------------------
// ✅ Login Route
// ---------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, role: user.role });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ---------------------
// ✅ Public Register Route (No token required)
// ---------------------
// Comment out or remove the public registration route
// router.post('/register', async (req, res) => {
//     const {
//         firstName,
//         lastName,
//         email,
//         password,
//         phone,
//         apartmentNumber,
//         propertyId,
//         emergencyContactName,
//         emergencyContactPhone,
//         emergencyContactRelationship
//     } = req.body;

//     try {
//         // Check if user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists with this email' });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create user
//         const newUser = new User({
//             name: `${firstName} ${lastName}`,
//             email,
//             password: hashedPassword,
//             role: 'user',
//             phone
//         });
//         await newUser.save();

//         // Create tenant (assign to selected property)
//         const tenant = new Tenant({
//             firstName,
//             lastName,
//             email,
//             phone,
//             propertyId,
//             apartmentNumber,
//             rentAmount: 0, // Admin will set the actual rent amount
//             emergencyContact: {
//                 name: emergencyContactName,
//                 phone: emergencyContactPhone,
//                 relationship: emergencyContactRelationship
//             },
//             status: 'active'
//         });
//         await tenant.save();

//         res.status(201).json({ message: 'User registered successfully' });
//     } catch (err) {
//         console.error('Registration error:', err);
//         res.status(500).json({ message: 'Registration failed' });
//     }
// });

// GET /api/properties - List all properties for registration dropdown
router.get('/properties', async (req, res) => {
    try {
        const properties = await Property.find({}, '_id propertyName ownerName');
        res.json({ properties });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch properties' });
    }
});

// GET /api/owners/stats - Admin only: get tenant count and total credited per owner
router.get('/owners/stats', authenticateToken, isAdmin, async (req, res) => {
    try {
        // Get all properties (owners)
        const properties = await Property.find({}, '_id ownerName');
        // For each property, count tenants and sum payments
        const stats = await Promise.all(properties.map(async (property) => {
            const tenantCount = await Tenant.countDocuments({ propertyId: property._id });
            const totalCredited = await RentPayment.aggregate([
                { $match: { propertyId: property._id, status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            return {
                ownerName: property.ownerName,
                tenantCount,
                totalCredited: totalCredited[0]?.total || 0
            };
        }));
        res.json({ stats });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch owner stats' });
    }
});

// ---------------------
// ✅ Get Current User
// ---------------------
router.get('/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
