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
