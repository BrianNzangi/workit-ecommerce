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

    // Handle local paths
    let relativePath = url;

    // If it already starts with /uploads/, use it as is
    if (url.startsWith('/uploads/')) {
        relativePath = url;
    }
    // If it starts with uploads/ (no leading slash), add the slash
    else if (url.startsWith('uploads/')) {
        relativePath = `/${url}`;
    }
    // If it's just a filename (the new format), prepend /uploads/
    else if (!url.startsWith('/')) {
        relativePath = `/uploads/${url}`;
    }
    // For any other relative path starting with /, assume it might be an upload or other static asset
    else {
        relativePath = url;
    }

    return `${cleanBaseUrl}${relativePath}`;
}
