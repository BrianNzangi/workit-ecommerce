
// For client-side requests, use the admin's own API proxy routes
// This ensures cookies are sent correctly (same-origin)
const getServerBackendUrl = () => {
    const env = process.env as Record<string, string | undefined>;
    return (
        env.BACKEND_API_URL ||
        env.BACKEND_URL ||
        env.NEXT_PUBLIC_BACKEND_URL ||
        env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3001"
    ).replace(/\/$/, "");
};

const API_URL = typeof window !== "undefined"
    ? "/api/admin"  // Client-side: use admin's API proxy
    : getServerBackendUrl(); // Server-side: direct backend

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

class HttpClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private isServerRequest() {
        return typeof window === "undefined";
    }

    private catalogAdminPath(resource: "products" | "collections" | "brands", suffix = "") {
        if (this.isServerRequest()) {
            return `/catalog/${resource}/admin${suffix}`;
        }
        return `/${resource}${suffix}`;
    }

    private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
        const { params, ...init } = options;

        let baseUrl = this.baseUrl;
        const isServer = typeof window === "undefined";

        // For server-side rendering, use direct backend URL
        if (isServer && baseUrl.startsWith("/")) {
            baseUrl = getServerBackendUrl();
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
    public get products() {
        return {
            list: (options?: any) => this.get<any>(this.catalogAdminPath("products"), { params: options }),
            get: (id: string) => this.get<any>(this.catalogAdminPath("products", `/${id}`)),
            create: (data: any) => this.post<any>(this.catalogAdminPath("products"), data),
            update: (id: string, data: any) => this.put<any>(this.catalogAdminPath("products", `/${id}`), data),
            remove: (id: string) => this.delete<any>(this.catalogAdminPath("products", `/${id}`)),
            search: (params: { q: string }) => this.get<any>(this.catalogAdminPath("products", "/search"), { params })
        };
    }

    public get collections() {
        return {
            list: (options?: any) => this.get<any>(this.catalogAdminPath("collections"), { params: options }),
            get: (id: string) => this.get<any>(this.catalogAdminPath("collections", `/${id}`)),
            create: (data: any) => this.post<any>(this.catalogAdminPath("collections"), data),
            update: (id: string, data: any) => this.put<any>(this.catalogAdminPath("collections", `/${id}`), data),
            remove: (id: string) => this.delete<any>(this.catalogAdminPath("collections", `/${id}`)),
            search: (params: { q: string }) => this.get<any>(this.catalogAdminPath("collections", "/search"), { params })
        };
    }

    public get brands() {
        return {
            list: (options?: any) => this.get<any>(this.catalogAdminPath("brands"), { params: options }),
            get: (id: string) => this.get<any>(this.catalogAdminPath("brands", `/${id}`)),
            create: (data: any) => this.post<any>(this.catalogAdminPath("brands"), data),
            update: (id: string, data: any) => this.put<any>(this.catalogAdminPath("brands", `/${id}`), data),
            remove: (id: string) => this.delete<any>(this.catalogAdminPath("brands", `/${id}`)),
            search: (params: { q: string }) => this.get<any>(this.catalogAdminPath("brands", "/search"), { params })
        };
    }

    public get assets() {
        return {
            list: (options?: any) => this.get<any>("/catalog/assets/admin", { params: options }),
            get: (id: string) => this.get<any>(`/catalog/assets/admin/${id}`),
            create: (data: any) => this.post<any>("/catalog/assets/admin", data),
            delete: (id: string) => this.delete<any>(`/catalog/assets/admin/${id}`),
            bulkDelete: (data: { ids: string[] }) => this.post<any>("/catalog/assets/admin/bulk-delete", data),
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

    public get users() {
        return {
            list: (options?: any) => this.get<any>("/identity/users/admin", { params: options }),
            create: (data: any) => this.post<any>("/identity/users/admin", data),
            get: (id: string) => this.get<any>(`/identity/users/admin/${id}`),
            update: (id: string, data: any) => this.patch<any>(`/identity/users/admin/${id}`, data),
            remove: (id: string) => this.delete<any>(`/identity/users/admin/${id}`),
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

    public get shippingZones() {
        return {
            list: (options?: any) => this.get<any>("/fulfillment/shipping/admin/zones", { params: options }),
            create: (data: any) => this.post<any>("/fulfillment/shipping/admin/zones", data),
            update: (id: string, data: any) => this.patch<any>(`/fulfillment/shipping/admin/zones/${id}`, data),
            delete: (id: string) => this.delete<any>(`/fulfillment/shipping/admin/zones/${id}`),
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
            products: (params?: any) => this.get<any>("/marketing/campaigns/admin/products", { params }),
            getSendPayload: (id: string) => this.get<any>(`/marketing/campaigns/admin/${id}/send-payload`),
            send: (id: string, data?: any) => this.post<any>(`/marketing/campaigns/admin/${id}/send`, data),
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
