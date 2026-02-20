'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { CustomerRecord, OrderRecord } from '@/components/admin/customers/types';
import {
    buildCustomerSegments,
    CustomerSegment,
    SegmentsEmptyState,
    SegmentsErrorState,
    SegmentsHeader,
    SegmentsLoadingState,
    SegmentsTable,
    SegmentsToolbar,
} from '@/components/admin/customers/segments';

export default function SegmentsPage() {
    const [segments, setSegments] = useState<CustomerSegment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSegments = async () => {
        try {
            setLoading(true);
            setError(null);

            const [customersResponse, ordersResponse] = await Promise.all([
                fetch('/api/admin/customers?limit=5000'),
                fetch('/api/admin/orders?limit=5000'),
            ]);

            if (!customersResponse.ok || !ordersResponse.ok) {
                throw new Error('Failed to load data for segments');
            }

            const customersPayload = await customersResponse.json();
            const ordersPayload = await ordersResponse.json();

            const customers: CustomerRecord[] = Array.isArray(customersPayload)
                ? customersPayload
                : (customersPayload.customers || []);
            const orders: OrderRecord[] = Array.isArray(ordersPayload)
                ? ordersPayload
                : (ordersPayload.orders || []);

            setSegments(buildCustomerSegments(customers, orders));
        } catch (fetchError) {
            console.error('Error fetching segments:', fetchError);
            setError(fetchError instanceof Error ? fetchError.message : 'Failed to load segments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSegments();
    }, []);

    const visibleSegments = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return segments;

        return segments.filter((segment) =>
            segment.name.toLowerCase().includes(normalizedSearch) ||
            segment.description.toLowerCase().includes(normalizedSearch)
        );
    }, [segments, searchTerm]);

    return (
        <ProtectedRoute>
            <AdminLayout>
                <SegmentsHeader totalSegments={segments.length} />

                {loading ? (
                    <SegmentsLoadingState />
                ) : error ? (
                    <SegmentsErrorState error={error} onRetry={fetchSegments} />
                ) : (
                    <>
                        <SegmentsToolbar
                            searchTerm={searchTerm}
                            visibleCount={visibleSegments.length}
                            onSearchTermChange={setSearchTerm}
                        />
                        {visibleSegments.length === 0 ? (
                            <SegmentsEmptyState />
                        ) : (
                            <SegmentsTable segments={visibleSegments} />
                        )}
                    </>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
