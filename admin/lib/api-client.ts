
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
}

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

        const headersObj: Record<string, string> = {
            ...options.headers,
        };

        let activeToken = this.token;

        // Try to get token from cookies if not manually set
        if (typeof document !== 'undefined') {
            activeToken = activeToken ||
                getCookie('better-auth.session_token') ||
                getCookie('auth_token');
        } else {
            // Server side: Try to get headers from Next.js context
            try {
                // We use dynamic import for next/headers to avoid bundling it on the client
                const { headers } = await import('next/headers');
                const headersList = await headers();
                const cookie = headersList.get('cookie');
                const authHeader = headersList.get('authorization');

                if (cookie && !headersObj['Cookie']) {
                    headersObj['Cookie'] = cookie;
                }
                if (authHeader && !headersObj['Authorization']) {
                    headersObj['Authorization'] = authHeader;
                }
            } catch (e) {
                // Not in a Next.js request context (e.g. build time or outside Next.js)
            }
        }

        // Don't set Content-Type for FormData, let the browser set it with boundary
        if (!(options.body instanceof FormData)) {
            if (!headersObj['Content-Type']) {
                headersObj['Content-Type'] = 'application/json';
            }
        }

        if (activeToken && !headersObj['Authorization']) {
            headersObj['Authorization'] = `Bearer ${activeToken}`;
        }

        const config: RequestInit = {
            credentials: 'include', // Important for cross-origin cookies
            ...options,
            headers: headersObj,
        };

        const response = await fetch(url, config);

        if (response.status === 401) {
            // Redirect to login if on client side
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `API request failed: ${response.statusText}`);
            } catch (e) {
                if (e instanceof Error && e.message.includes('API request failed')) throw e;
                throw new Error(`API request failed: ${response.statusText}`);
            }
        }

        if (response.status === 204) {
            return null as T;
        }

        return response.json();
    }

    get<T>(endpoint: string, options?: FetchOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, data?: any, options?: FetchOptions) {
        const isFormData = data instanceof FormData;
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    put<T>(endpoint: string, data?: any, options?: FetchOptions) {
        const isFormData = data instanceof FormData;
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    patch<T>(endpoint: string, data?: any, options?: FetchOptions) {
        const isFormData = data instanceof FormData;
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: isFormData ? data : JSON.stringify(data),
        });
    }

    delete<T>(endpoint: string, options?: FetchOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient(API_URL || "");

export const setAuthToken = (token: string | null) => {
    apiClient.setToken(token);
};
