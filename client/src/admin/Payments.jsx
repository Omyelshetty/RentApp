// client/src/admin/Payments.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Payments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddPayment, setShowAddPayment] = useState(false);
    const [newPayment, setNewPayment] = useState({
        tenantId: '',
        amount: '',
        paymentDate: '',
        paymentMethod: 'cash',
        description: ''
    });

    useEffect(() => {
        fetchPayments();
        fetchTenants();
    }, []);

    const fetchPayments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/payments', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPayments(data);
            } else {
                console.error('Failed to fetch payments');
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTenants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/tenants', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTenants(data);
            }
        } catch (error) {
            console.error('Error fetching tenants:', error);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!newPayment.tenantId || !newPayment.amount || !newPayment.paymentDate || !newPayment.paymentMethod) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate amount
        if (newPayment.amount <= 0) {
            alert('Amount must be greater than 0');
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

            const response = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newPayment)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to add payment';
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
            alert('Payment added successfully!');
            setShowAddPayment(false);
            setNewPayment({
                tenantId: '',
                amount: '',
                paymentDate: '',
                paymentMethod: 'cash',
                description: ''
            });
            fetchPayments();
        } catch (error) {
            console.error('Error adding payment:', error);
            alert('An error occurred while adding the payment');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateMonthlyPayments = async () => {
        if (!confirm('This will generate monthly payments for all active tenants. Continue?')) {
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

            const response = await fetch('http://localhost:5000/api/payments/generate-monthly-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    month: new Date().toLocaleString('default', { month: 'long' }),
                    year: new Date().getFullYear()
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Failed to generate monthly payments';
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
            alert(data.message);
            fetchPayments();
        } catch (error) {
            console.error('Error generating monthly payments:', error);
            alert('An error occurred while generating monthly payments');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/');
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            paid: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            overdue: 'bg-red-100 text-red-800',
            partial: 'bg-blue-100 text-blue-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status || 'Unknown'}
            </span>
        );
    };

    const getPaymentMethodBadge = (method) => {
        const methodClasses = {
            cash: 'bg-green-100 text-green-800',
            card: 'bg-blue-100 text-blue-800',
            bank_transfer: 'bg-purple-100 text-purple-800',
            check: 'bg-orange-100 text-orange-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${methodClasses[method] || 'bg-gray-100 text-gray-800'}`}>
                {method?.replace('_', ' ').toUpperCase() || 'Unknown'}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return `₹${parseInt(amount).toLocaleString('en-IN')}`;
    };

    const filteredPayments = payments.filter(payment => {
        const tenant = tenants.find(t => t._id === payment.tenantId);
        const matchesSearch = tenant?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tenant?.apartmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === 'all' || payment.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleGenerateMonthlyPayments}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                Generate Monthly Payments
                            </button>
                            <button
                                onClick={() => setShowAddPayment(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                + Add Payment
                            </button>
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                            <div className="flex-1 max-w-md">
                                <label htmlFor="search" className="sr-only">Search payments</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="search"
                                        type="text"
                                        placeholder="Search by tenant name or property..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="partial">Partial</option>
                                </select>
                                <span className="text-sm text-gray-600">
                                    {filteredPayments.length} of {payments.length} payments
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tenant
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Method
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No payments found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => {
                                        const tenant = tenants.find(t => t._id === payment.tenantId);
                                        return (
                                            <tr key={payment._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-blue-600">
                                                                    {tenant?.firstName?.charAt(0)}{tenant?.lastName?.charAt(0)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {tenant?.firstName} {tenant?.lastName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {tenant?.apartmentNumber}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(payment.paymentDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPaymentMethodBadge(payment.paymentMethod)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(payment.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {payment.description || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Payment Modal */}
            {showAddPayment && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Payment</h3>
                            <form onSubmit={handleAddPayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tenant *
                                    </label>
                                    <select
                                        name="tenantId"
                                        value={newPayment.tenantId}
                                        onChange={(e) => setNewPayment(prev => ({ ...prev, tenantId: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a tenant</option>
                                        {tenants.map(tenant => (
                                            <option key={tenant._id} value={tenant._id}>
                                                {tenant.firstName} {tenant.lastName} - {tenant.apartmentNumber}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Amount (₹) *
                                    </label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={newPayment.amount}
                                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                                        required
                                        min="0"
                                        step="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter amount in INR"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="paymentDate"
                                        value={newPayment.paymentDate}
                                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method *
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={newPayment.paymentMethod}
                                        onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="check">Check</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={newPayment.description}
                                        onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Payment description"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddPayment(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? 'Adding...' : 'Add Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments; 