
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    setToken(token: string | null) {
        this.token = token;
    }

    public async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config: RequestInit = {
            ...options,
            headers,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            // Try to parse error message from JSON response
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `API request failed: ${response.statusText}`);
            } catch (e) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
        }

        // Handle empty responses (e.g. 204 No Content)
        if (response.status === 204) {
            return null as T;
        }

        return response.json();
    }

    get<T>(endpoint: string, options?: FetchOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, data?: any, options?: FetchOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    put<T>(endpoint: string, data?: any, options?: FetchOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    patch<T>(endpoint: string, data?: any, options?: FetchOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    delete<T>(endpoint: string, options?: FetchOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient(API_URL || "");

// Helper for consistency with previous axios implementation
export const setAuthToken = (token: string | null) => {
    apiClient.setToken(token);
};
