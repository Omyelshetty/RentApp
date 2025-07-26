import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [tenants, setTenants] = useState([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/tenants')
            .then((res) => res.json())
            .then((data) => setTenants(data))
            .catch((err) => console.error('Error fetching tenants:', err));
    }, []);

    const total = tenants.length;
    const paid = tenants.filter(t => t.paymentStatus === 'paid').length;
    const pending = total - paid;

    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-6">Welcome to Dashboard</h1>
            <p className="mb-8">Manage rent collection here</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white shadow-md p-4 rounded-lg border">
                    <h2 className="text-lg font-semibold">Total Tenants</h2>
                    <p className="text-2xl font-bold">{total}</p>
                </div>
                <div className="bg-green-100 shadow-md p-4 rounded-lg border border-green-400">
                    <h2 className="text-lg font-semibold">Paid</h2>
                    <p className="text-2xl font-bold text-green-700">{paid}</p>
                </div>
                <div className="bg-red-100 shadow-md p-4 rounded-lg border border-red-400">
                    <h2 className="text-lg font-semibold">Pending</h2>
                    <p className="text-2xl font-bold text-red-700">{pending}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
