// src/lib/auth.ts
import { graphqlRequest } from './graphql-client';

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
}

export async function getActiveCustomer(): Promise<Customer | null> {
    try {
        const { data, errors } = await graphqlRequest({
            query: `
                query GetActiveCustomer {
                    customer {
                        id
                        firstName
                        lastName
                        emailAddress
                        phoneNumber
                        addresses {
                            id
                            fullName
                            streetLine1
                            streetLine2
                            city
                            province
                            postalCode
                            country {
                                code
                                name
                            }
                            defaultShippingAddress
                            defaultBillingAddress
                        }
                    }
                }
            `,
        });

        if (errors) {
            console.error('GraphQL errors:', errors);
            return null;
        }

        return data?.customer || null;
    } catch (error) {
        console.error('Error fetching active customer:', error);
        return null;
    }
}

export async function loginCustomer(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { data, errors } = await graphqlRequest({
            query: `
                mutation Login($username: String!, $password: String!) {
                    login(username: $username, password: $password) {
                        ... on CurrentUser {
                            id
                            identifier
                        }
                        ... on ErrorResult {
                            errorCode
                            message
                        }
                    }
                }
            `,
            variables: {
                username: email,
                password,
            },
        });

        if (errors) {
            console.error('GraphQL errors:', errors);
            return { success: false, error: errors[0]?.message || 'Login failed' };
        }

        if (data?.login?.__typename === 'CurrentUser') {
            return { success: true };
        } else {
            return { success: false, error: data?.login?.message || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
    }
}

export async function logoutCustomer(): Promise<void> {
    try {
        await graphqlRequest({
            query: `
                mutation Logout {
                    logout {
                        success
                    }
                }
            `,
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
        const { data, errors } = await graphqlRequest({
            query: `
                mutation RegisterCustomer($input: RegisterCustomerInput!) {
                    registerCustomerAccount(input: $input) {
                        ... on Success {
                            success
                        }
                        ... on ErrorResult {
                            errorCode
                            message
                        }
                    }
                }
            `,
            variables: {
                input,
            },
        });

        if (errors) {
            console.error('GraphQL errors:', errors);
            return { success: false, error: errors[0]?.message || 'Registration failed' };
        }

        if (data?.registerCustomerAccount?.__typename === 'Success') {
            // After registration, log the customer in
            return await loginCustomer(input.emailAddress, input.password);
        } else {
            return { success: false, error: data?.registerCustomerAccount?.message || 'Registration failed' };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Registration failed' };
    }
}
