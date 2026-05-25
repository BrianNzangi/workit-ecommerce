'use client';

import { useMemo } from 'react';
import { useSession, authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
}

export function useAuth() {
    const { data: session, isPending: loading, error } = useSession();
    const router = useRouter();

    const customer: Customer | null = useMemo(() => {
        if (!session?.user) return null;

        return {
            id: session.user.id,
            firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || '',
            lastName: (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
            emailAddress: session.user.email,
            phoneNumber: '',
        };
    }, [session?.user]);

    const login = async () => {
        router.push('/login');
        return { success: true };
    };

    const register = async () => {
        router.push('/register');
        return { success: true };
    };

    const logout = async () => {
        let signedOut = false;

        try {
            const result = await authClient.signOut();
            if (result?.error) {
                console.error(result.error);
            } else {
                signedOut = true;
            }
        } catch (e) {
            console.error(e);
        }

        if (!signedOut) {
            try {
                const fallbackResponse = await fetch('/api/auth/sign-out', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: '{}',
                });
                signedOut = fallbackResponse.ok;
            } catch (fallbackError) {
                console.error(fallbackError);
            }
        }

        if (typeof window !== 'undefined') {
            window.location.assign('/');
            return { success: signedOut };
        }

        router.replace('/');
        router.refresh();
        return { success: signedOut };
    };

    return {
        customer,
        user: session?.user,
        loading,
        error: error ? error.message : null,
        login,
        register,
        logout,
        isAuthenticated: !!session,
        refreshCustomer: async () => {
            router.refresh();
        },
    };
}
