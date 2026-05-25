/**
 * Metadata Constants
 * 
 * Centralized SEO and Open Graph configuration for the Workit storefront.
 */

export const SITE_CONFIG = {
    name: "Workit",
    title: "Workit - Best Deals on Phones, Laptops, TVs & Accessories",
    description: "Find the best deals on phones, laptops, TVs, and accessories at Workit. Trusted electronics store with fast delivery and reliable customer support.",
    url: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL || "https://www.workit.co.ke",
    logo: "/workit-logo.png",
    twitterHandle: "@workit_ke", // Update if there's a specific handle
};

export const DEFAULT_OG = {
    type: "website",
    siteName: SITE_CONFIG.name,
    locale: "en_KE",
    images: [
        {
            url: `${SITE_CONFIG.url}${SITE_CONFIG.logo}`,
            width: 1200,
            height: 630,
            alt: SITE_CONFIG.title,
        },
    ],
};

export const DEFAULT_TWITTER = {
    card: "summary_large_image",
    site: SITE_CONFIG.twitterHandle,
    creator: SITE_CONFIG.twitterHandle,
};
