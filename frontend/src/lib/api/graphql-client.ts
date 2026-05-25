/**
 * GraphQL Client Utility
 * 
 * A simple utility for making GraphQL requests to the backend API.
 * This replaces the Vendure Apollo Client with a lightweight fetch-based approach.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface GraphQLResponse<T = any> {
    data?: T;
    errors?: Array<{
        message: string;
        locations?: Array<{ line: number; column: number }>;
        path?: string[];
    }>;
}

export interface GraphQLRequestOptions {
    query: string;
    variables?: Record<string, any>;
    headers?: Record<string, string>;
}

/**
 * Make a GraphQL query request
 * 
 * @param options - GraphQL query options
 * @returns Promise with GraphQL response
 * 
 * @example
 * ```typescript
 * const { data, errors } = await graphqlRequest({
 *   query: `
 *     query GetCollections {
 *       collections(options: { parentId: null }) {
 *         id
 *         name
 *         slug
 *       }
 *     }
 *   `,
 * });
 * ```
 */
export async function graphqlRequest<T = any>(
    options: GraphQLRequestOptions
): Promise<GraphQLResponse<T>> {
    const { query, variables, headers = {} } = options;

    try {
        const response = await fetch(`${API_URL}/api/store`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: GraphQLResponse<T> = await response.json();

        if (result.errors) {
            console.error('❌ GraphQL errors:', result.errors);
            // Log detailed error information
            result.errors.forEach((error, index) => {
                console.error(`Error ${index + 1}:`, {
                    message: error.message,
                    locations: error.locations,
                    path: error.path,
                    extensions: (error as any).extensions,
                });
            });
        }

        return result;
    } catch (error) {
        console.error('GraphQL request failed:', error);
        throw error;
    }
}

/**
 * Make a GraphQL query request and return only the data
 * Throws an error if there are GraphQL errors
 * 
 * @param options - GraphQL query options
 * @returns Promise with data only
 * 
 * @example
 * ```typescript
 * const collections = await graphqlQuery({
 *   query: `query GetCollections { collections { id name } }`,
 * });
 * ```
 */
export async function graphqlQuery<T = any>(
    options: GraphQLRequestOptions
): Promise<T> {
    const { data, errors } = await graphqlRequest<T>(options);

    if (errors && errors.length > 0) {
        throw new Error(errors.map(e => e.message).join(', '));
    }

    if (!data) {
        throw new Error('No data returned from GraphQL query');
    }

    return data;
}

/**
 * Get the configured API URL
 */
export function getApiUrl(): string {
    return API_URL;
}
