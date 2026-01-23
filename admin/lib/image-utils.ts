/**
 * Image URL Utility
 * 
 * Handles image URL normalization for the admin panel.
 * Images are served from the backend URL.
 */

// Get backend URL from environment or use default
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3001';

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

    // If starts with /uploads/, prepend backend URL
    if (url.startsWith('/uploads/')) {
        return `${BACKEND_URL}${url}`;
    }

    // If starts with uploads/ (no leading slash), add it and prepend backend URL
    if (url.startsWith('uploads/')) {
        return `${BACKEND_URL}/${url}`;
    }

    // For any other relative path, ensure it starts with / and prepend backend URL
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
}
