'use client';

import { useEffect, useMemo, useState } from 'react';
import { CustomerService } from '@/lib/services/customers/customer.service';
import { CustomerRecord } from './types';
import { getCustomerName } from './customers-utils';
import { CustomersToolbar } from './CustomersToolbar';
import { CustomersTabs } from './CustomersTabs';
import { CustomersLoadingState } from './CustomersLoadingState';
import { CustomersErrorState } from './CustomersErrorState';
import { CustomersEmptyState } from './CustomersEmptyState';
import { CustomersTable } from './CustomersTable';

export function CustomersList() {
    const [customers, setCustomers] = useState<CustomerRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);

            const customerService = new CustomerService();
            const result = await customerService.getCustomers({ limit: 500 });
            const customersList = Array.isArray(result) ? result : (result.customers || []);
            
            // Enrich customers with order data
            const enrichedCustomers = await Promise.all(
                customersList.map(async (customer: any) => {
                    try {
                        const ordersResponse: any = await customerService.getCustomerOrders(customer.id);
                        const ordersArray = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.orders || []);
                        const totalSpent = ordersArray.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
                        
                        return {
                            ...customer,
                            location: customer.location || customer.city || 'Nairobi, Kenya',
                            ordersCount: ordersArray.length,
                            totalSpent,
                        };
                    } catch {
                        return {
                            ...customer,
                            location: customer.location || customer.city || 'Nairobi, Kenya',
                            ordersCount: 0,
                            totalSpent: 0,
                        };
                    }
                })
            );
            
            setCustomers(enrichedCustomers);
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
        let filtered = customers;

        if (activeTab === 'new') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            filtered = filtered.filter((c) => new Date(c.createdAt) >= thirtyDaysAgo);
        } else if (activeTab === 'returning') {
            filtered = filtered.filter((c) => (c.ordersCount || 0) > 1);
        }

        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (normalizedSearch) {
            filtered = filtered.filter((customer) => {
                const fullName = getCustomerName(customer).toLowerCase();
                return (
                    fullName.includes(normalizedSearch) ||
                    (customer.email || '').toLowerCase().includes(normalizedSearch) ||
                    (customer.location || '').toLowerCase().includes(normalizedSearch)
                );
            });
        }

        return filtered;
    }, [customers, searchTerm, activeTab]);

    if (loading) {
        return <CustomersLoadingState />;
    }

    if (error) {
        return <CustomersErrorState error={error} onRetry={fetchCustomers} />;
    }

    return (
        <div>
            <CustomersTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <CustomersToolbar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            {filteredCustomers.length === 0 ? (
                <CustomersEmptyState searchTerm={searchTerm} />
            ) : (
                <CustomersTable customers={filteredCustomers} />
            )}
        </div>
    );
}
