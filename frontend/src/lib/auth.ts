import { apiClient, setAuthToken } from './api-client';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

/**
 * Get the active customer profile via NestJS API
 */
export async function getActiveCustomer(): Promise<Customer | null> {
    try {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    } catch (error) {
        return null;
    }
}

/**
 * Login customer via NestJS API
 */
export async function loginCustomer(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await apiClient.post('/auth/login', { email, password });
        const { access_token, user } = response.data;

        setAuthToken(access_token);

        return { success: true };
    } catch (error: any) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Login failed'
        };
    }
}

/**
 * Logout customer
 */
export async function logoutCustomer(): Promise<void> {
    setAuthToken(null);
}

/**
 * Register customer via NestJS API
 */
export async function registerCustomer(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await apiClient.post('/auth/register', input);
        const { access_token } = response.data;

        setAuthToken(access_token);

        return { success: true };
    } catch (error: any) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: error.response?.data?.message || 'Registration failed'
        };
    }
}
