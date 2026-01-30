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
    ],
    dangerouslyAllowSVG: true,
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        // Proxy all /api requests except /api/auth which is handled locally by Better Auth
        source: '/api/((?!auth).*)',
        destination: `${backendUrl}/api/:1*`,
      },
    ];
  },
};

export default nextConfig;
