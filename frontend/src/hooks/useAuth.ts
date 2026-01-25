'use client';

import { useSession, signOut, authClient } from "@/lib/auth-client";
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

    const customer: Customer | null = session?.user ? {
        id: session.user.id,
        firstName: (session.user as any).firstName || session.user.name?.split(' ')[0] || '',
        lastName: (session.user as any).lastName || session.user.name?.split(' ').slice(1).join(' ') || '',
        emailAddress: session.user.email,
        phoneNumber: '',
    } : null;

    const login = async () => {
        router.push('/login');
        return { success: true };
    };

    const register = async () => {
        router.push('/register');
        return { success: true };
    };

    const logout = async () => {
        try {
            await signOut();
            router.refresh();
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false };
        }
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
