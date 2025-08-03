// client/src/admin/AddTenant.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddTenant = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [ownerStats, setOwnerStats] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        apartmentNumber: '',
        rentAmount: '',
        propertyId: '',
        documents: {
            idProof: ''
        }
    });

    useEffect(() => {
        // Fetch property/owner list
        fetch('http://localhost:5000/api/auth/properties')
            .then(res => res.json())
            .then(data => setProperties(data.properties || []))
            .catch(error => {
                console.error('Error fetching properties:', error);
                setProperties([]);
            });
        // Fetch owner stats
        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5000/api/auth/owners/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => setOwnerStats(data.stats || []))
                .catch(error => {
                    console.error('Error fetching owner stats:', error);
                    setOwnerStats([]);
                });
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            // Special handling for rentAmount to ensure it's a valid number
            if (name === 'rentAmount') {
                // Only allow positive numbers and prevent invalid values
                const numValue = value === '' ? '' : parseFloat(value);
                if (value === '' || (!isNaN(numValue) && numValue >= 0)) {
                    setFormData(prev => ({
                        ...prev,
                        [name]: value
                    }));
                }
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: value
                }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!formData.firstName || !formData.lastName || !formData.email ||
            !formData.phone || !formData.apartmentNumber || !formData.rentAmount || !formData.propertyId) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            alert('Please enter a valid email address');
            return;
        }

        // Validate rent amount
        const rentAmountNum = parseFloat(formData.rentAmount);
        if (isNaN(rentAmountNum) || rentAmountNum <= 0) {
            alert('Rent amount must be a valid positive number');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('No authentication token found. Please login again.');
                navigate('/login');
                return;
            }

            // Prepare form data with proper number conversion for rentAmount
            const submitData = {
                ...formData,
                rentAmount: rentAmountNum
            };

            const response = await fetch('http://localhost:5000/api/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(submitData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Authentication failed. Please login again.');
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                    navigate('/login');
                    return;
                }
                const errorText = await response.text();
                let errorMessage = 'Failed to add tenant';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                    if (errorData.details) {
                        console.error('Server error details:', errorData.details);
                    }
                } catch (parseError) {
                    console.error('Error parsing response:', errorText);
                }
                alert(errorMessage);
                return;
            }

            const data = await response.json();
            alert('Tenant added successfully!');
            navigate('/admin/tenants');
        } catch (error) {
            console.error('Error adding tenant:', error);
            alert('An error occurred while adding the tenant. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                ← Back to Dashboard
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Add New Tenant</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Welcome, Admin</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Owner Stats */}
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-blue-900">Owner Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ownerStats.map(stat => (
                            <div key={stat.ownerName} className="bg-white rounded shadow p-3">
                                <div className="font-bold text-gray-800">{stat.ownerName}</div>
                                <div className="text-sm text-gray-600">Tenants: {stat.tenantCount}</div>
                                <div className="text-sm text-gray-600">Total Credited: ₹{stat.totalCredited.toLocaleString('en-IN')}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Tenant Information</h2>
                        <p className="text-sm text-gray-600 mt-1">Fill in the details below to register a new tenant</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Owner/Property Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Property / Owner *</label>
                            <select
                                name="propertyId"
                                value={formData.propertyId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select property/owner</option>
                                {properties.map(property => (
                                    <option key={property._id} value={property._id}>
                                        {property.propertyName} ({property.ownerName})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Rental Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Rental Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apartment/House Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="apartmentNumber"
                                        value={formData.apartmentNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., A101, Flat 2B, House 15"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Monthly Rent Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="rentAmount"
                                        value={formData.rentAmount}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter rent amount in INR"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Document Information */}
                        <div>
                            <h3 className="text-md font-medium text-gray-900 mb-4">Document Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ID Proof Number (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="documents.idProof"
                                        value={formData.documents.idProof}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Aadhar, PAN, Driving License, etc. (Optional)"
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Submit Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/dashboard')}
                                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Adding Tenant...' : 'Add Tenant'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddTenant;
