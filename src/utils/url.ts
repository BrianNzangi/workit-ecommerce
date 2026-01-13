/**
 * Sanitizes URLs by replacing backslashes with forward slashes
 * This fixes issues with Vendure asset URLs on Windows systems
 */
export const sanitizeUrl = (url: string | undefined | null): string => {
    if (!url) return '';
    return url.replace(/\\/g, '/');
};
