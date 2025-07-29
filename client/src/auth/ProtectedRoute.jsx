// src/auth/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const token = localStorage.getItem('token');

    if (!token) return <Navigate to="/" />;

    try {
        const decoded = jwtDecode(token);
        const userRole = decoded.role;

        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/" />;
        }

        return children;
    } catch (err) {
        console.error('Invalid token:', err);
        return <Navigate to="/" />;
    }
};

export default ProtectedRoute;
