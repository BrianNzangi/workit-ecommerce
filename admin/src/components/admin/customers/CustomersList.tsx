'use client';

import { useEffect, useMemo, useState } from 'react';
import { CustomerService } from '@/lib/services/customers/customer.service';
import { CustomerRecord } from './types';
import { getCustomerName } from './customers-utils';
import { CustomersToolbar } from './CustomersToolbar';
import { CustomersLoadingState } from './CustomersLoadingState';
import { CustomersErrorState } from './CustomersErrorState';
import { CustomersEmptyState } from './CustomersEmptyState';
import { CustomersTable } from './CustomersTable';

export function CustomersList() {
    const [customers, setCustomers] = useState<CustomerRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            const customerService = new CustomerService();
            const result = await customerService.getCustomers({ limit: 500 });
            const customersList = Array.isArray(result) ? result : (result.customers || []);
            setCustomers(customersList);
        } catch (fetchError) {
            console.error('Error fetching customers:', fetchError);
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return customers;

        return customers.filter((customer) => {
            const fullName = getCustomerName(customer).toLowerCase();
            return (
                fullName.includes(normalizedSearch) ||
                (customer.email || '').toLowerCase().includes(normalizedSearch) ||
                (customer.phoneNumber || '').toLowerCase().includes(normalizedSearch)
            );
        });
    }, [customers, searchTerm]);

    if (loading) {
        return <CustomersLoadingState />;
    }

    if (error) {
        return <CustomersErrorState error={error} onRetry={fetchCustomers} />;
    }

    return (
        <div>
            <CustomersToolbar
                searchTerm={searchTerm}
                totalCustomers={customers.length}
                filteredCustomers={filteredCustomers.length}
                onSearchTermChange={setSearchTerm}
            />

            {filteredCustomers.length === 0 ? (
                <CustomersEmptyState searchTerm={searchTerm} />
            ) : (
                <CustomersTable customers={filteredCustomers} />
            )}
        </div>
    );
}
