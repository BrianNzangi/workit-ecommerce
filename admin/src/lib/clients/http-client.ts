
// For client-side requests, use the admin's own API proxy routes
// This ensures cookies are sent correctly (same-origin)
const API_URL = typeof window !== "undefined"
    ? "/api/admin"  // Client-side: use admin's API proxy
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"; // Server-side: direct backend

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

class HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const { params, ...init } = options;

        let baseUrl = this.baseUrl;
        const isServer = typeof window === "undefined";

        // For server-side rendering, use direct backend URL
        if (isServer && baseUrl.startsWith("/")) {
            baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
        }

        let url = `${baseUrl}${path}`;
        if (params) {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });
            url += `?${searchParams.toString()}`;
        }

        const headers = new Headers(init.headers);
        const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;

        // Add content type if not set and method implies body, and NOT FormData
        if (!headers.has("Content-Type") && ["POST", "PUT", "PATCH"].includes(init.method || "GET") && !isFormData) {
            headers.set("Content-Type", "application/json");
        }

        // Forward cookies for SSR if needed
        if (typeof window === "undefined") {
            try {
                const { headers: nextHeaders } = await import("next/headers");
                const headersList = await nextHeaders();
                const cookie = headersList.get("cookie");
                if (cookie) {
                    headers.set("Cookie", cookie);
                }
            } catch (e) {
                // Ignore
            }
        } else {
            init.credentials = "include"; // For client-side requests
        }

        const response = await fetch(url, { ...init, headers });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "Unknown error" }));
            throw { statusCode: response.status, message: error.message || response.statusText, ...error };
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    public get<T>(path: string, options?: RequestOptions) {
        return this.request<T>(path, { ...options, method: "GET" });
    }

    public post<T>(path: string, body?: any, options?: RequestOptions) {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.request<T>(path, { ...options, method: "POST", body: isFormData ? body : JSON.stringify(body) });
    }

    public put<T>(path: string, body?: any, options?: RequestOptions) {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.request<T>(path, { ...options, method: "PUT", body: isFormData ? body : JSON.stringify(body) });
    }

    public patch<T>(path: string, body?: any, options?: RequestOptions) {
        const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
        return this.request<T>(path, { ...options, method: "PATCH", body: isFormData ? body : JSON.stringify(body) });
    }

    public delete<T>(path: string, options?: RequestOptions) {
        return this.request<T>(path, { ...options, method: "DELETE" });
    }

    // Resource namespaces
    public get auth() {
        return {
            login: (data: any) => this.post<any>("/auth/login", data),
            register: (data: any) => this.post<any>("/auth/register", data),
            getSession: () => this.get<any>("/auth/get-session"),
            logout: () => this.post<any>("/auth/logout", {}),
        };
    }

    public get products() {
        return {
            list: (options?: any) => this.get<any>("/catalog/products/admin", { params: options }),
            get: (id: string) => this.get<any>(`/catalog/products/admin/${id}`),
            create: (data: any) => this.post<any>("/catalog/products/admin", data),
            update: (id: string, data: any) => this.put<any>(`/catalog/products/admin/${id}`, data),
            remove: (id: string) => this.delete<any>(`/catalog/products/admin/${id}`),
            search: (params: { q: string }) => this.get<any>("/catalog/products/admin/search", { params })
        };
    }

    public get collections() {
        return {
            list: (options?: any) => this.get<any>("/catalog/collections/admin", { params: options }),
            get: (id: string) => this.get<any>(`/catalog/collections/admin/${id}`),
            create: (data: any) => this.post<any>("/catalog/collections/admin", data),
            update: (id: string, data: any) => this.put<any>(`/catalog/collections/admin/${id}`, data),
            remove: (id: string) => this.delete<any>(`/catalog/collections/admin/${id}`),
            search: (params: { q: string }) => this.get<any>("/catalog/collections/admin/search", { params })
        };
    }

    public get brands() {
        return {
            list: (options?: any) => this.get<any>("/catalog/brands/admin", { params: options }),
            get: (id: string) => this.get<any>(`/catalog/brands/admin/${id}`),
            create: (data: any) => this.post<any>("/catalog/brands/admin", data),
            update: (id: string, data: any) => this.put<any>(`/catalog/brands/admin/${id}`, data),
            remove: (id: string) => this.delete<any>(`/catalog/brands/admin/${id}`),
            search: (params: { q: string }) => this.get<any>("/catalog/brands/admin/search", { params })
        };
    }

    public get assets() {
        return {
            list: (options?: any) => this.get<any>("/catalog/assets/admin", { params: options }),
            get: (id: string) => this.get<any>(`/catalog/assets/admin/${id}`),
            create: (data: any) => this.post<any>("/catalog/assets/admin", data),
            delete: (id: string) => this.delete<any>(`/catalog/assets/admin/${id}`),
        };
    }

    public get homepageCollections() {
        return {
            list: (options?: any) => this.get<any>("/marketing/homepage/admin", { params: options }),
            get: (id: string) => this.get<any>(`/marketing/homepage/admin/${id}`),
            create: (data: any) => this.post<any>("/marketing/homepage/admin", data),
            update: (id: string, data: any) => this.put<any>(`/marketing/homepage/admin/${id}`, data),
            remove: (id: string) => this.delete<any>(`/marketing/homepage/admin/${id}`),
        };
    }
    public get orders() {
        return {
            list: (options?: any) => this.get<any>("/fulfillment/orders/admin", { params: options }),
            get: (id: string) => this.get<any>(`/fulfillment/orders/admin/${id}`),
            create: (data: any) => this.post<any>("/fulfillment/orders/admin", data), // Usually public checkout, but admin might allow manual creation
            updateStatus: (id: string, data: any) => this.patch<any>(`/fulfillment/orders/admin/${id}/status`, data),
            update: (id: string, data: any) => this.put<any>(`/fulfillment/orders/admin/${id}`, data),
        };
    }

    public get customers() {
        return {
            list: (options?: any) => this.get<any>("/identity/customers/admin", { params: options }),
            get: (id: string) => this.get<any>(`/identity/customers/admin/${id}`),
            create: (data: any) => this.post<any>("/identity/customers/admin", data),
            update: (id: string, data: any) => this.put<any>(`/identity/customers/admin/${id}`, data),
            remove: (id: string) => this.delete<any>(`/identity/customers/admin/${id}`),
            // Address management placeholders (Backend pending)
            createAddress: (data: any) => this.post<any>(`/identity/customers/admin/${data.id}/addresses`, data),
            updateAddress: (data: any) => this.put<any>(`/identity/customers/admin/addresses/${data.id}`, data),
            removeAddress: (data: { id: string }) => this.delete<any>(`/identity/customers/admin/addresses/${data.id}`),
            getOrders: (params: { id: string }) => this.get<any>(`/identity/customers/admin/${params.id}/orders`),
        };
    }

    public get analytics() {
        return {
            getWeeklyStats: () => this.get<any>("/analytics/weekly-stats"),
            getSalesStats: () => this.get<any>("/analytics/sales-stats"),
            getWeeklyChart: () => this.get<any>("/analytics/weekly-chart"),
            getRecentOrders: (options?: any) => this.get<any>("/analytics/recent-orders", { params: options }),
        };
    }

    public get shipping() { // Maps to Shipping Methods
        return {
            list: (options?: any) => this.get<any>("/fulfillment/shipping/admin", { params: options }),
            get: (id: string) => this.get<any>(`/fulfillment/shipping/admin/${id}`),
            create: (data: any) => this.post<any>("/fulfillment/shipping/admin", data),
            update: (id: string, data: any) => this.put<any>(`/fulfillment/shipping/admin/${id}`, data),
            delete: (id: string) => this.delete<any>(`/fulfillment/shipping/admin/${id}`),
        };
    }

    public get banners() {
        return {
            list: (options?: any) => this.get<any>("/marketing/banners/admin", { params: options }),
            get: (id: string) => this.get<any>(`/marketing/banners/admin/${id}`),
            create: (data: any) => this.post<any>("/marketing/banners/admin", data),
            update: (id: string, data: any) => this.put<any>(`/marketing/banners/admin/${id}`, data),
            delete: (id: string) => this.delete<any>(`/marketing/banners/admin/${id}`),
            search: (params: { q: string }) => this.get<any>("/marketing/banners/admin/search", { params }),
            bulkDelete: (data: { ids: string[] }) => this.post<any>("/marketing/banners/admin/bulk-delete", data),
        };
    }

    public get campaigns() {
        return {
            list: (options?: any) => this.get<any>("/marketing/campaigns/admin", { params: options }),
            get: (id: string) => this.get<any>(`/marketing/campaigns/admin/${id}`),
            create: (data: any) => this.post<any>("/marketing/campaigns/admin", data),
            update: (id: string, data: any) => this.put<any>(`/marketing/campaigns/admin/${id}`, data),
            delete: (id: string) => this.delete<any>(`/marketing/campaigns/admin/${id}`),
            search: (params: { q: string }) => this.get<any>("/marketing/campaigns/admin/search", { params }),
            bulkDelete: (data: { ids: string[] }) => this.post<any>("/marketing/campaigns/admin/bulk-delete", data),
        };
    }

    public get blog() {
        return {
            list: (options?: any) => this.get<any>("/marketing/blog/admin", { params: options }),
            get: (id: string) => this.get<any>(`/marketing/blog/admin/${id}`),
            create: (data: any) => this.post<any>("/marketing/blog/admin", data),
            update: (id: string, data: any) => this.put<any>(`/marketing/blog/admin/${id}`, data),
            delete: (id: string) => this.delete<any>(`/marketing/blog/admin/${id}`),
            getBySlug: (slug: string) => this.get<any>(`/marketing/blog/admin/slug/${slug}`),
            togglePublish: (id: string, data: any = {}) => this.patch<any>(`/marketing/blog/admin/${id}/toggle-publish`, data),
        };
    }

    public get settings() {
        return {
            getAll: () => this.get<any>("/site/settings/admin"),
            updateAll: (data: Record<string, any>) => this.post<any>("/site/settings/admin", data),
            get: (key: string) => this.get<any>(`/site/settings/admin/${key}`),
            update: (key: string, value: any) => this.post<any>("/site/settings/admin", { [key]: value }),
        };
    }
}

export const httpClient = new HttpClient(API_URL);
