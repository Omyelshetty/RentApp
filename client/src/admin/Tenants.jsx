// src/admin/Tenants.jsx

import React from 'react';
import TenantList from '../components/TenantList';

const Tenants = () => {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Tenant List</h2>
            <TenantList />
        </div>
    );
};

export default Tenants;
