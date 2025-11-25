// src/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
}

export function useAuth() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomer = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setCustomer(data.customer);
            } else {
                setCustomer(null);
            }
        } catch (err) {
            console.error('Error fetching customer:', err);
            setCustomer(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (data.success) {
                await fetchCustomer();
                return { success: true };
            } else {
                setError(data.error || 'Login failed');
                return { success: false, error: data.error };
            }
        } catch (err) {
            const errorMsg = 'Login failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const register = async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (result.success) {
                await fetchCustomer();
                return { success: true };
            } else {
                setError(result.error || 'Registration failed');
                return { success: false, error: result.error };
            }
        } catch (err) {
            const errorMsg = 'Registration failed';
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setCustomer(null);
            return { success: true };
        } catch (err) {
            console.error('Logout error:', err);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomer();
    }, [fetchCustomer]);

    return {
        customer,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!customer,
        refreshCustomer: fetchCustomer,
    };
}
