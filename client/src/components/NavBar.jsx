import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

const NavBar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    let user = null;
    if (token) {
        try {
            const decoded = jwt_decode(token);
            const isExpired = decoded.exp * 1000 < Date.now();
            if (!isExpired) {
                user = decoded;
            } else {
                localStorage.clear();
                navigate('/');
            }
        } catch (err) {
            localStorage.clear();
            navigate('/');
        }
    }

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow">
            <h1 className="text-xl font-bold">Rent Manager</h1>

            <div className="space-x-4 flex items-center">
                {user && (
                    <>
                        <Link to="/" className="hover:text-blue-400">Dashboard</Link>

                        {user.role === 'admin' && (
                            <>
                                <Link to="/tenants" className="hover:text-blue-400">View Tenants</Link>
                                <Link to="/add-tenant" className="hover:text-blue-400">Add Tenant</Link>
                            </>
                        )}

                        {user.role === 'user' && (
                            <Link to="/my-receipts" className="hover:text-blue-400">My Receipts</Link>
                        )}

                        <span className="text-sm text-gray-300 ml-4">Hi, {user.username}</span>
                        <button onClick={handleLogout} className="ml-4 bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm">Logout</button>
                    </>
                )}

                {!user && (
                    <Link to="/" className="hover:text-blue-400">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default NavBar;
