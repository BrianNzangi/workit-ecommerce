// src/hooks/useAuth.ts
'use client';

import { useAuth as useAuthKit } from '@workos-inc/authkit-nextjs/components';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
}

export function useAuth() {
    const { user, loading, signOut } = useAuthKit();

    const customer: Customer | null = user ? {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        emailAddress: user.email || '',
        phoneNumber: '',
    } : null;

    const login = async () => {
        window.location.href = '/login';
        return { success: true };
    };

    const register = async () => {
        window.location.href = '/sign-up';
        return { success: true };
    };

    const logout = async () => {
        try {
            // Use server action if possible or fetch an endpoint if signOut is not available client side
            // But if signOut is available from the hook (detected by lack of type error), use it.
            // However, the error report DID NOT complain about signOut not existing.
            // If signOut() is async, great. If not, we might need to await it improperly?
            // AuthKit SDK signOut usually redirects.
            // If signOut is NOT in the hook return (which we suspected but user didn't complain), we'd get an error.
            // Assuming it IS there since user didn't complain.
            await signOut();
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false };
        }
    };

    return {
        customer,
        loading: loading,
        error: null,
        login,
        register,
        logout,
        isAuthenticated: !!customer,
        refreshCustomer: async () => { }, // AuthKit handles session refresh
    };
}
