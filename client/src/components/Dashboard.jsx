import React, { useEffect, useState } from 'react';

const Dashboard = () => {
    const [tenants, setTenants] = useState([]);

    const fetchTenants = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tenants');
            const data = await response.json();
            setTenants(data);
        } catch (error) {
            console.error('Error fetching tenants:', error);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const paidTenants = tenants.filter(t => t.paymentStatus === 'paid');
    const pendingTenants = tenants.filter(t => t.paymentStatus !== 'paid');
    const rentAmount = 10000; // 🔁 You can make this dynamic later
    const totalCollected = paidTenants.length * rentAmount;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 max-w-4xl">
            <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
                <p className="text-sm text-gray-700">Total Tenants</p>
                <h2 className="text-xl font-bold">{tenants.length}</h2>
            </div>
            <div className="bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-sm text-gray-700">Paid</p>
                <h2 className="text-xl font-bold">{paidTenants.length}</h2>
            </div>
            <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded">
                <p className="text-sm text-gray-700">Pending</p>
                <h2 className="text-xl font-bold">{pendingTenants.length}</h2>
            </div>
            <div className="bg-yellow-100 border-l-4 border-yellow-600 p-4 rounded col-span-1 sm:col-span-3">
                <p className="text-sm text-gray-700">Total Collected</p>
                <h2 className="text-xl font-bold">₹ {totalCollected.toLocaleString()}</h2>
            </div>
        </div>
    );
};

export default Dashboard; 