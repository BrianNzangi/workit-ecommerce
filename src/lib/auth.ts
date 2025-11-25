// src/lib/auth.ts
import { vendureClient } from './vendure-client';
import { GET_ACTIVE_CUSTOMER, LOGIN, LOGOUT, REGISTER_CUSTOMER } from './vendure-queries';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
}

export async function getActiveCustomer(): Promise<Customer | null> {
    try {
        const { data } = await vendureClient.query({
            query: GET_ACTIVE_CUSTOMER,
        }) as { data: any };

        return data.activeCustomer;
    } catch (error) {
        console.error('Error fetching active customer:', error);
        return null;
    }
}

export async function loginCustomer(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { data } = await vendureClient.mutate({
            mutation: LOGIN,
            variables: {
                username: email,
                password,
            },
        }) as { data: any };

        if (data.login.__typename === 'CurrentUser') {
            return { success: true };
        } else {
            return { success: false, error: data.login.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
    }
}

export async function logoutCustomer(): Promise<void> {
    try {
        await vendureClient.mutate({
            mutation: LOGOUT,
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
}

export async function registerCustomer(input: {
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const { data } = await vendureClient.mutate({
            mutation: REGISTER_CUSTOMER,
            variables: {
                input,
            },
        }) as { data: any };

        if (data.registerCustomerAccount.__typename === 'Success') {
            // After registration, log the customer in
            return await loginCustomer(input.emailAddress, input.password);
        } else {
            return { success: false, error: data.registerCustomerAccount.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Registration failed' };
    }
}
