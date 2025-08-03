// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import Dashboard from './admin/Dashboard.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import PaymentOptions from './user/PaymentOptions.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

// Admin Components
import AddTenant from './admin/AddTenant.jsx';
import Tenants from './admin/Tenants.jsx';
import RegisterUser from './admin/RegisterUser.jsx';
import Payments from './admin/Payments.jsx';
import Reports from './admin/Reports.jsx';
import Settings from './admin/Settings.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login should be the landing page */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        {/* Remove or comment out the register route */}
        {/* <Route path="/register" element={<Register />} /> */}

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/Dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-tenant"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddTenant />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tenants"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Tenants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/register-user"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RegisterUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/payment-options"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <PaymentOptions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
