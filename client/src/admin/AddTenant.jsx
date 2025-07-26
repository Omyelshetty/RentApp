import React, { useState } from 'react';

const AddTenant = () => {
    const [formData, setFormData] = useState({
        name: '',
        houseAddress: '',
        phone: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.houseAddress || !formData.phone) {
            alert('Please fill all fields');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/tenants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Tenant added successfully!');
                setFormData({ name: '', houseAddress: '', phone: '' });
            } else {
                alert('Failed to add tenant');
            }
        } catch (error) {
            console.error('Error adding tenant:', error);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Add New Tenant</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Tenant Name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="houseAddress"
                    placeholder="House Address"
                    value={formData.houseAddress}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <input
                    type="text"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add Tenant
                </button>
            </form>
        </div>
    );
};

export default AddTenant;
