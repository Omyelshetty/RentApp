import jwt from 'jsonwebtoken';

// JWT Secret - same as auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, role, name, email }
        next();
    } catch (err) {
        console.error('Token verification error:', err);
        res.status(403).json({ message: 'Invalid token.' });
    }
}

export function isAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
}
