import { StoreAuthService } from './store-auth.service';
export declare class StoreAuthController {
    private storeAuthService;
    constructor(storeAuthService: StoreAuthService);
    register(registerData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
    }): Promise<void>;
    login(loginData: {
        email: string;
        password: string;
    }): Promise<void>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: "ADMIN" | "CUSTOMER" | null;
    }>;
    updateProfile(req: any, updates: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
    }): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: "ADMIN" | "CUSTOMER" | null;
    }>;
}
