/**
 * Image URL Utility
 * 
 * Handles image URL normalization for the admin panel.
 * Images are served from the backend URL or an optional dedicated media host.
 */

function getMediaBaseUrl(): string | null {
    const env = process.env as Record<string, string | undefined>;
    const mediaUrl = env['NEXT_PUBLIC_MEDIA_URL']?.trim();

    if (!mediaUrl) {
        return null;
    }

    return mediaUrl.replace(/\/$/, '');
}

function normalizeRelativeAssetPath(url: string): string {
    if (url.startsWith('/uploads/')) {
        return url;
    }

    if (url.startsWith('uploads/')) {
        return `/${url}`;
    }

    if (!url.startsWith('/')) {
        return `/uploads/${url}`;
    }

    return url;
}

function joinMediaUrl(mediaBaseUrl: string, relativePath: string): string {
    try {
        const parsed = new URL(mediaBaseUrl);
        const pathname = parsed.pathname.replace(/\/+$/, '');
        const origin = parsed.origin;

        // Support both:
        // - NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke
        // - NEXT_PUBLIC_MEDIA_URL=https://media.workit.co.ke/uploads
        if (!pathname || pathname === '/') {
            return `${origin}${relativePath}`;
        }

        if (pathname === '/uploads' && relativePath.startsWith('/uploads/')) {
            return `${origin}${relativePath}`;
        }

        return `${mediaBaseUrl}${relativePath}`;
    } catch {
        return `${mediaBaseUrl}${relativePath}`;
    }
}

function getLocalUploadsProxyPath(url: string): string | null {
    try {
        const parsed = new URL(url);
        if (!parsed.pathname.startsWith('/uploads/')) {
            return null;
        }

        const isLocalAdmin =
            typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (!isLocalAdmin) {
            return null;
        }

        return `${parsed.pathname}${parsed.search}`;
    } catch {
        return null;
    }
}


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

    // If it's a full URL (http/https), prefer local /uploads proxy in local dev
    if (url.startsWith('http://') || url.startsWith('https://')) {
        const localProxyPath = getLocalUploadsProxyPath(url);
        if (localProxyPath) {
            return localProxyPath;
        }
        return url;
    }

    // If it's a data URL, return as-is
    if (url.startsWith('data:')) {
        return url;
    }

    const mediaBaseUrl = getMediaBaseUrl();

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

    const relativePath = normalizeRelativeAssetPath(url);

    return mediaBaseUrl
        ? joinMediaUrl(mediaBaseUrl, relativePath)
        : `${cleanBaseUrl}${relativePath}`;
}
