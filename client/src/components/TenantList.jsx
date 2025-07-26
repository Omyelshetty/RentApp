import React, { useEffect, useState } from 'react';

const TenantList = () => {
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

    const markAsPaid = async (id) => {
        const utr = prompt('Enter UTR number or type "cash" if paid by cash:');
        if (!utr) return;

        try {
            const response = await fetch(`http://localhost:5000/api/tenants/${id}/pay`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentStatus: 'paid', utrNumber: utr }),
            });

            if (response.ok) {
                fetchTenants(); // Refresh list
            } else {
                alert('Failed to update payment status');
            }
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg max-w-6xl mx-auto overflow-x-auto">
            <h2 className="text-2xl font-bold mb-4">🏠 Tenant Rent Status</h2>

            {tenants.length === 0 ? (
                <p className="text-gray-500">No tenants found.</p>
            ) : (
                <table className="w-full text-sm text-left border border-gray-300 rounded">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 border">Name</th>
                            <th className="p-3 border">House Address</th>
                            <th className="p-3 border">Phone</th>
                            <th className="p-3 border">Status</th>
                            <th className="p-3 border">UTR</th>
                            <th className="p-3 border">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tenants.map((tenant) => (
                            <tr key={tenant._id} className="border-t hover:bg-gray-50">
                                <td className="p-3 border">{tenant.name}</td>
                                <td className="p-3 border">{tenant.houseAddress}</td>
                                <td className="p-3 border">{tenant.phone}</td>
                                <td className="p-3 border font-semibold">
                                    {tenant.paymentStatus === 'paid' ? (
                                        <span className="text-green-600">✅ Paid</span>
                                    ) : (
                                        <span className="text-red-600">❌ Pending</span>
                                    )}
                                </td>
                                <td className="p-3 border">{tenant.utrNumber || '-'}</td>
                                <td className="p-3 border">
                                    {tenant.paymentStatus !== 'paid' && (
                                        <button
                                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                                            onClick={() => markAsPaid(tenant._id)}
                                        >
                                            Mark as Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TenantList;
