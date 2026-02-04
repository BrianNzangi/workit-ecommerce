import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
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
        hostname: 'staging.workit.co.ke',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return [
      // Explicit Assets Rewrite (Priority)
      {
        source: '/api/admin/assets',
        destination: `${backendUrl}/catalog/assets/admin`,
      },
      {
        source: '/api/admin/assets/:path*',
        destination: `${backendUrl}/catalog/assets/admin/:path*`,
      },
      // Catalog
      {
        source: '/api/admin/products/:path*',
        destination: `${backendUrl}/catalog/products/admin/:path*`,
      },
      {
        source: '/api/admin/collections/:path*',
        destination: `${backendUrl}/catalog/collections/admin/:path*`,
      },
      {
        source: '/api/admin/brands/:path*',
        destination: `${backendUrl}/catalog/brands/admin/:path*`,
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
        destination: `${backendUrl}/marketing/homepage/:path*`,
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
