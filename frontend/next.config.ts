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
  images: {
    unoptimized: true, 
    // Fixes the quality "95" error by explicitly listing allowed compiler steps
    qualities: [25, 50, 75, 95],
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
        protocol: 'https',
        hostname: 'api.workit.co.ke',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'media.workit.co.ke',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.awin1.com',
        pathname: '/**',
      },
      ...mediaRemotePattern,
    ],
    // Allow loading images from localhost (development only)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://www.googletagmanager.com https://www.clarity.ms https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http://localhost:*",
              "connect-src 'self' https://api.paystack.co https://graph.facebook.com https://www.google-analytics.com https://api.workit.co.ke https://media.workit.co.ke http://localhost:*",
              "frame-src https://standard.paystack.com",
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
  async redirects() {
    return [
      {
        source: '/help',
        destination: '/help-center',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/about-workit',
        permanent: true,
      },
      {
        source: '/orders',
        destination: '/dashboard?section=orders',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const backendUrl =
      process.env.BACKEND_API_URL?.trim() ||
      process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
      process.env.NEXT_PUBLIC_API_URL?.trim() ||
      'http://localhost:3001';

    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
