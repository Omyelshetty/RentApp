// src/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/" replace />;

    try {
        const decoded = jwtDecode(token);

        if (role && decoded.role !== role) {
            return <Navigate to="/" replace />;
        }

        return children;
    } catch (err) {
        console.error('Token decoding failed:', err);
        return <Navigate to="/" replace />;
    }
};

export default ProtectedRoute;
