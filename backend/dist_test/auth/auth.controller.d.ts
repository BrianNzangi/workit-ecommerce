import { AuthService } from './auth.service';
import type { LoginInput, RegisterInput } from '@workit/validation';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(input: RegisterInput): Promise<{
        access_token: string;
        user: {
            name: string;
            id: string;
            email: string;
            emailVerified: boolean;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            role: "ADMIN" | "CUSTOMER" | null;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    login(input: LoginInput): Promise<{
        access_token: string;
        user: {
            name: string;
            id: string;
            email: string;
            emailVerified: boolean;
            image: string | null;
            createdAt: Date;
            updatedAt: Date;
            role: "ADMIN" | "CUSTOMER" | null;
            firstName: string | null;
            lastName: string | null;
        };
    }>;
    getProfileBySession(req: any): any;
    getProfile(req: any): any;
}
