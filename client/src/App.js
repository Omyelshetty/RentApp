// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Login from './auth/Login.jsx';
import Dashboard from './admin/Dashboard.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import ProtectedRoute from './auth/ProtectedRoute.jsx';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login should be the landing page */}
        <Route path="/" element={<Login />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* User Route */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
