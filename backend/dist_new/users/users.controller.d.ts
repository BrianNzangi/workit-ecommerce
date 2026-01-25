import { UsersService } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }[]>;
    create(input: any): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    update(id: string, input: any): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        image: string | null;
        createdAt: Date;
        updatedAt: Date;
        role: "ADMIN" | "CUSTOMER" | null;
        firstName: string | null;
        lastName: string | null;
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
