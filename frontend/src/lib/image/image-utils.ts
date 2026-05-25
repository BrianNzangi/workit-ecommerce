export function shouldBypassImageOptimization(
    url: string | undefined | null
): boolean {
    if (!url) return false;
    return false;
}

/**
 * Normalize image URL for use in Next.js application
 *
 * Images are served through the Next.js /uploads rewrite proxy to the
 * backend, which streams from R2 object storage.  This avoids any
 * dependency on the media CDN (media.workit.co.ke).
 *
 * Handles:
 * - Absolute CDN URLs    -> converted to relative /uploads/ paths
 * - External URLs        -> returned as-is (awin.com etc.)
 * - Relative paths       -> normalised to /uploads/...
 * - Data URLs            -> returned as-is
 */
export function getImageUrl(
    url: string | undefined | null
): string {
    if (!url || url.trim() === '') {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPHN2Zz4=';
    }

    if (url.startsWith('data:')) return url;

    // Strip the domain from any absolute /uploads/ URL so the image loads
    // through the Next.js /uploads rewrite proxy -> backend -> R2.
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const parsed = new URL(url);
            if (parsed.pathname.startsWith('/uploads/')) {
                return parsed.pathname;
            }
        } catch { /* invalid URL, fall through */ }
        return url;
    }

    if (url.startsWith('/uploads/')) return url;
    if (url.startsWith('uploads/')) return `/${url}`;
    if (!url.startsWith('/')) return `/uploads/${url}`;
    return url;
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
