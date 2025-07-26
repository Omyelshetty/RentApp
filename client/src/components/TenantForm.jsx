// TenantForm component 
import React, { useState } from 'react';

const TenantForm = () => {
    const [name, setName] = useState('');
    const [houseAddress, setHouseAddress] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const tenant = {
            name,
            houseAddress,
            phone,
        };

        try {
            const response = await fetch('http://localhost:5000/api/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tenant),
            });

            if (response.ok) {
                alert('Tenant added successfully');
                setName('');
                setHouseAddress('');
                setPhone('');
            } else {
                alert('Failed to add tenant');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error');
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-4 rounded shadow mb-4 max-w-md"
        >
            <h2 className="text-lg font-semibold mb-2">Add Tenant</h2>
            <div className="mb-2">
                <label className="block mb-1">Full Name</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">House Address</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={houseAddress}
                    onChange={(e) => setHouseAddress(e.target.value)}
                    required
                />
            </div>
            <div className="mb-2">
                <label className="block mb-1">Phone Number</label>
                <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
            </div>
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Add Tenant
            </button>
        </form>
    );
};

export default TenantForm;
