import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "http://localhost:3000",
    fetchOptions: {
        credentials: "include",
    },
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
