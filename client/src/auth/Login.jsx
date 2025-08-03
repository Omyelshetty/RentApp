import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            alert('Please fill in all fields.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || 'Login failed');
                return;
            }

            localStorage.setItem('token', data.token);
            const decoded = jwtDecode(data.token);
            localStorage.setItem('role', decoded.role);
            localStorage.setItem('userName', decoded.name);

            // Navigate based on actual user role from token
            if (decoded.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (decoded.role === 'user') {
                navigate('/user/dashboard');
            } else {
                alert('Unknown role detected.');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
            style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1950&q=80)',
            }}>
            <div className="backdrop-blur-lg bg-gray-900/80 shadow-2xl rounded-2xl px-10 py-10 w-full max-w-md border border-white/20 text-white">
                <h2 className="text-3xl font-bold text-center mb-6 text-white">RentApp Login</h2>
                <p className="text-center text-gray-300 mb-6">Sign in to your account</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 text-gray-300">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                            <span
                                className="absolute right-3 top-2.5 text-sm text-gray-300 cursor-pointer hover:text-white"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? 'Hide' : 'Show'}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition text-white py-2 rounded-lg font-semibold shadow-md">
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Demo Accounts:
                    </p>
                    <div className="mt-4 text-xs text-gray-500 space-y-1">
                        <p><strong>Admin:</strong> admin@rentapp.com / admin123</p>
                        <p><strong>User:</strong> user@rentapp.com / user123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
