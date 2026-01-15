import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/assets/**',
      },
      {
        protocol: 'https',
        hostname: 'staging.workit.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cms.workit.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.workit.co.ke',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.awin1.com',
        pathname: '/**',
      },
    ],
    // Allow loading images from localhost (development only)
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
};

export default nextConfig;
