"use client";

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth Client Instance
 * Use this for client-side authentication operations
 */
const authBaseURL =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "");

export const authClient = createAuthClient({
    baseURL: authBaseURL,
    fetchOptions: {
        credentials: "include",
    },
});

/**
 * Export auth hooks for easy access
 */
export const {
    useSession,
    signIn,
    signUp,
    signOut,
} = authClient;

export const useUser = () => {
    const { data } = useSession();
    return data?.user;
};

/**
 * Custom hook for checking admin role
 */
export function useIsAdmin() {
    const { data: session } = useSession();
    return (session?.user as any)?.role === "ADMIN";
}

/**
 * Custom hook for getting full user name
 */
export function useFullName() {
    const { data: session } = useSession();
    const user = session?.user as any;

    if (!user?.firstName && !user?.lastName) {
        return user?.email || "Guest";
    }

    return `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
}
