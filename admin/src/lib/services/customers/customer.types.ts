export interface Customer {
    id: string;
    email: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
    addresses?: any[];
    orders?: any[];
}

export interface CreateCustomerInput {
    email: string;
    firstName: string;
    lastName: string;
    name?: string;
    phoneNumber?: string;
    password?: string;
}

export interface CustomerSearchOptions {
    take?: number;
    skip?: number;
}
