import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './admin/Dashboard';
import Tenants from './admin/Tenants';
import PaymentList from './components/PaymentList';
import TenantList from './components/TenantList';
import LoginPage from './auth/LoginPage'; // assuming you have this
import UserDashboard from './user/UserDashboard'; // optional
import MyReceipts from './user/MyReceipts'; // optional

import ProtectedRoute from './auth/ProtectedRoute';
import NavBar from './components/NavBar';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100">
                <NavBar />

                <div className="p-6">
                    <Routes>
                        {/* Public Route */}
                        <Route path="/" element={<LoginPage />} />

                        {/* Protected Admin Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute role="admin">
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/tenants"
                            element={
                                <ProtectedRoute role="admin">
                                    <Tenants />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payments"
                            element={
                                <ProtectedRoute role="admin">
                                    <PaymentList />
                                </ProtectedRoute>
                            }
                        />

                        {/* Protected User Routes */}
                        <Route
                            path="/user-dashboard"
                            element={
                                <ProtectedRoute role="user">
                                    <UserDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-receipts"
                            element={
                                <ProtectedRoute role="user">
                                    <MyReceipts />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
