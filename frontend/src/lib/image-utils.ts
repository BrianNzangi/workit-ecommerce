/**
 * Image URL Utility
 * 
 * Handles image URL normalization for the storefront.
 * Images are stored in PostgreSQL and served from public/uploads directory.
 */

/**
 * Normalize image URL for use in Next.js application
 * 
 * Handles:
 * - Local paths from backend uploads directory (prepends backend URL)
 * - External URLs (for backward compatibility)
 * - Data URLs
 * 
 * @param url - The original image URL (can be relative or absolute)
 * @returns Normalized image URL
 */
export function getImageUrl(
    url: string | undefined | null
): string {
    // Return placeholder if no URL provided
    if (!url || url.trim() === '') {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4=';
    }

    // If it's a full URL (http/https), return as-is
    // This handles external URLs and legacy ImageKit URLs for backward compatibility
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a data URL, return as-is
    if (url.startsWith('data:')) {
        return url;
    }

    // Determine the base backend URL
    let backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.BACKEND_API_URL ||
        'http://localhost:3001';

    // Proactive fix for production: If we are in the browser on a workit.co.ke domain
    // and the backend URL is still pointing to localhost, switch to the production API.
    if (typeof window !== 'undefined') {
        const host = window.location.hostname;
        if (host.includes('workit.co.ke') && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1'))) {
            backendUrl = 'https://api.workit.co.ke';
        }
    }

    // Remove trailing slash from backendUrl if present
    const cleanBaseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;

    // If starts with /uploads/, prepend backend URL
    if (url.startsWith('/uploads/')) {
        return `${cleanBaseUrl}${url}`;
    }

    // If starts with uploads/ (no leading slash), add it and prepend backend URL
    if (url.startsWith('uploads/')) {
        return `${cleanBaseUrl}/${url}`;
    }

    // For any other relative path, ensure it starts with / and prepend backend URL
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBaseUrl}${normalizedPath}`;
}

/**
 * Get normalized product image URL
 * 
 * Note: Next.js Image component handles optimization automatically.
 * 
 * @param url - Original image URL
 * @param size - Image size preset (kept for API compatibility, not used)
 * @returns Normalized image URL
 */
export function getProductImageUrl(
    url: string | undefined | null,
    size?: 'thumbnail' | 'card' | 'detail' | 'full'
): string {
    return getImageUrl(url);
}

/**
 * Get normalized collection/banner image URL
 * 
 * Note: Next.js Image component handles optimization automatically.
 * 
 * @param url - Original image URL
 * @param size - Image size preset (kept for API compatibility, not used)
 * @returns Normalized image URL
 */
export function getCollectionImageUrl(
    url: string | undefined | null,
    size?: 'thumbnail' | 'banner' | 'hero'
): string {
    return getImageUrl(url);
}

// Legacy export for backward compatibility
export const getImageKitUrl = getImageUrl;
