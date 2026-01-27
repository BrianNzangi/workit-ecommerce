import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_ADMIN_BASE_URL || "http://127.0.0.1:3002",
});

export const { useSession, signIn, signUp, signOut } = authClient;
