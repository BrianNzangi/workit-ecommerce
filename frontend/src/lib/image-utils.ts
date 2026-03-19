/**
 * Image URL Utility
 * 
 * Handles image URL normalization for the storefront.
 * Images are stored in PostgreSQL and served from the backend uploads route,
 * optionally through a dedicated media hostname/CDN.
 */

function getMediaBaseUrl(): string | null {
    const env = process.env as Record<string, string | undefined>;
    const mediaUrl = env['NEXT_PUBLIC_MEDIA_URL']?.trim();

    if (!mediaUrl) {
        return null;
    }

    return mediaUrl.replace(/\/$/, '');
}

export function shouldBypassImageOptimization(
    url: string | undefined | null
): boolean {
    const mediaBaseUrl = getMediaBaseUrl();

    if (!mediaBaseUrl || !url) {
        return false;
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
        return false;
    }

    const normalizedUrl = trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
        ? trimmedUrl
        : getImageUrl(trimmedUrl);

    return normalizedUrl.startsWith(mediaBaseUrl);
}

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

    const mediaBaseUrl = getMediaBaseUrl();

    // Prefer a dedicated media/CDN host when configured; otherwise keep the
    // same-origin /uploads path so the existing rewrites continue to work.
    return mediaBaseUrl ? `${mediaBaseUrl}${relativePath}` : relativePath;
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
