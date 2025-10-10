import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://workit.co.ke'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cart', '/checkout', '/sign-in', '/dashboard', '/orders'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
