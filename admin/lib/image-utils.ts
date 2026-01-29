/**
 * Image URL Utility
 * 
 * Handles image URL normalization for the admin panel.
 * Images are served from the backend URL.
 */


/**
 * Normalize image URL for use in Next.js application
 * 
 * Handles:
 * - Local paths from backend uploads directory (uploads/...)
 * - Paths already strictly starting with /uploads/
 * - External URLs
 * - Data URLs
 * 
 * @param url - The original image URL (can be relative or absolute)
 * @returns Normalized image URL
 */
export function getImageUrl(url: string | undefined | null): string {
    // Return placeholder if no URL provided
    if (!url || url.trim() === '') {
        return '';
    }

    // If it's a full URL (http/https), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    // If it's a data URL, return as-is
    if (url.startsWith('data:')) {
        return url;
    }

    // Determine the base backend URL
    // We use bracket notation to prevent Next.js from inlining these values at build time
    const env = process.env as Record<string, string | undefined>;
    let backendUrl = env['NEXT_PUBLIC_BACKEND_URL'] ||
        env['NEXT_PUBLIC_API_URL'] ||
        env['BACKEND_API_URL'] ||
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
