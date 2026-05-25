'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CUSTOMER_KEY = ['customer'] as const;

async function fetchCustomer() {
    const response = await fetch('/api/customer');
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch customer');
    return data;
}

async function updateCustomer(body: Record<string, unknown>) {
    const response = await fetch('/api/customer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update customer');
    return data;
}

export function useCustomer() {
    return useQuery({
        queryKey: CUSTOMER_KEY,
        queryFn: fetchCustomer,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

export function useUpdateCustomer() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCustomer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: CUSTOMER_KEY });
        },
    });
}
