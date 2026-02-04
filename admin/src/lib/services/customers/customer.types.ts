import { customers } from '@workit/api';

export type Customer = customers.Customer;
export type CreateCustomerInput = customers.CreateCustomerInput;

export interface CustomerSearchOptions {
    take?: number;
    skip?: number;
}
