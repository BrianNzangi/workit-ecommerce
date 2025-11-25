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
},

env: {
  WOOCOMMERCE_API_URL: process.env.NEXT_PUBLIC_WOOCOMMERCE_API_URL,
    WOOCOMMERCE_CONSUMER_KEY: process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY,
      WOOCOMMERCE_CONSUMER_SECRET: process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_SECRET,
  },
};

export default nextConfig;
