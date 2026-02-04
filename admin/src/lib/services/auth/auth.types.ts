export interface RegisterAdminInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';
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
