import type { UserRole } from "@/lib/auth/rbac";

export interface RegisterAdminInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthPayload {
    token: string;
    access_token: string;
    user: any;
    expiresAt: Date;
}
