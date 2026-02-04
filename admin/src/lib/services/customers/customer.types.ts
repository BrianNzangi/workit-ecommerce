import { customers } from '@workit/api';

export type Customer = customers.Customer;

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
