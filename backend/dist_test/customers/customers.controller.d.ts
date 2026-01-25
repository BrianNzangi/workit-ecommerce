import { CustomersService } from './customers.service';
export declare class CustomersController {
    private customersService;
    constructor(customersService: CustomersService);
    findAll(): Promise<{
        success: boolean;
        customers: {
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
        }[];
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        customer: {
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
        };
    }>;
    create(input: any): Promise<{
        success: boolean;
        customer: {
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
    update(id: string, input: any): Promise<{
        success: boolean;
        customer: {
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
        };
    }>;
    delete(id: string): Promise<{
        success: boolean;
    }>;
}
