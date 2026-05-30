import type { NextConfig } from "next";

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL;
const mediaRemotePattern = (() => {
  if (!mediaUrl) return [];

  try {
    const parsed = new URL(mediaUrl);
    return [
      {
        protocol: parsed.protocol.replace(':', ''),
        hostname: parsed.hostname,
        ...(parsed.port ? { port: parsed.port } : {}),
        pathname: '/uploads/**',
      },
    ] as any[];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: Boolean(mediaUrl),
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3002',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.workit.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.workit.co.ke',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'staging.workit.co.ke',
        pathname: '/**',
      },
      ...mediaRemotePattern,
    ],
    dangerouslyAllowSVG: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http://localhost:*",
              "connect-src 'self' https://api.workit.co.ke https://media.workit.co.ke http://localhost:*",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === 'production' ? 'http://workit-backend:3001' : 'http://localhost:3001');
    return [
      // NOTE: /api/admin/assets is handled by the route.ts handler (not a rewrite)
      // to properly support file uploads with streaming body
      // Catalog
      {
        source: '/api/admin/products/:path*',
        destination: `${backendUrl}/catalog/products/_admin/:path*`,
      },
      {
        source: '/api/admin/collections/:path*',
        destination: `${backendUrl}/catalog/collections/admin/:path*`,
      },
      {
        source: '/api/admin/brands/:path*',
        destination: `${backendUrl}/catalog/brands/admin/:path*`,
      },
      {
        source: '/api/admin/assets/:path*',
        destination: `${backendUrl}/catalog/assets/admin/:path*`,
      },


      // Marketing
      {
        source: '/api/admin/marketing/banners/:path*',
        destination: `${backendUrl}/marketing/banners/:path*`,
      },
      {
        source: '/api/admin/marketing/campaigns/:path*',
        destination: `${backendUrl}/marketing/campaigns/:path*`,
      },
      {
        source: '/api/admin/marketing/blog/:path*',
        destination: `${backendUrl}/marketing/blog/:path*`,
      },
      {
        source: '/api/admin/marketing/homepage/:path*',
        destination: `${backendUrl}/marketing/homepage/:path*`,
      },
      {
        source: '/api/admin/homepage-collections/:path*',
        destination: `${backendUrl}/marketing/homepage/admin/:path*`,
      },
      {
        // Map marketing stats to analytics weekly-stats for now as fallback
        source: '/api/admin/marketing/stats',
        destination: `${backendUrl}/analytics/weekly-stats`,
      },


      // Fulfillment
      {
        source: '/api/admin/orders/:path*',
        destination: `${backendUrl}/fulfillment/orders/admin/:path*`,
      },
      {
        source: '/api/admin/shipping-methods/:path*',
        destination: `${backendUrl}/fulfillment/shipping/admin/:path*`,
      },
      {
        source: '/api/admin/shipping-zones/:path*',
        destination: `${backendUrl}/fulfillment/shipping/admin/zones/:path*`,
      },

      // Identity
      {
        source: '/api/admin/customers/:path*',
        destination: `${backendUrl}/identity/customers/admin/:path*`,
      },
      {
        source: '/api/admin/users/:path*',
        destination: `${backendUrl}/identity/users/admin/:path*`,
      },
      {
        source: '/api/admin/users',
        destination: `${backendUrl}/identity/users/admin/`,
      },

      // Settings
      {
        source: '/api/admin/settings',
        destination: `${backendUrl}/site/settings/admin`,
      },
      {
        source: '/api/admin/settings/:path*',
        destination: `${backendUrl}/site/settings/admin/:path*`,
      },

      // Fallbacks
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
