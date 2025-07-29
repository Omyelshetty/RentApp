import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { verifyToken } from '../middleware/verifyToken.js';

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
// ✅ Register Route (Admin Only)
// ---------------------
router.post('/register', verifyToken, async (req, res) => {
    const admin = req.user;
    if (admin.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Only admin can register users.' });
    }
    const { email, password, name, role, phone, address, apartmentNumber, rentAmount, emergencyContact, documents } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            phone,
            address
        });
        await newUser.save();
        // Also create a tenant if not already present
        let tenant = await Tenant.findOne({ email });
        if (!tenant) {
            // Split name into first and last
            let firstName = name.split(' ')[0];
            let lastName = name.split(' ').slice(1).join(' ') || '';
            tenant = new Tenant({
                firstName,
                lastName,
                email,
                phone: phone || '',
                apartmentNumber: apartmentNumber || '',
                rentAmount: rentAmount || 0,
                emergencyContact: emergencyContact || {},
                documents: documents || {},
                status: 'active'
            });
            await tenant.save();
        }
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Register Error:', err);
        res.status(500).json({ message: 'Server error' });
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
