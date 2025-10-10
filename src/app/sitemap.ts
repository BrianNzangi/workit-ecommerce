import { MetadataRoute } from 'next'

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description?: string;
  children?: Category[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://workit.co.ke'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about-workit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/warranty-refunds`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  try {
    // Fetch categories from the API
    const categoriesRes = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (categoriesRes.ok) {
      const categories: Category[] = await categoriesRes.json()

      // Function to recursively get all category slugs
      const getAllCategorySlugs = (cats: Category[]): string[] => {
        const slugs: string[] = []
        for (const cat of cats) {
          slugs.push(cat.slug)
          if (cat.children && cat.children.length > 0) {
            slugs.push(...getAllCategorySlugs(cat.children))
          }
        }
        return slugs
      }

      const categorySlugs = getAllCategorySlugs(categories)

      // Add category pages to sitemap
      const categoryPages: MetadataRoute.Sitemap = categorySlugs.map(slug => ({
        url: `${baseUrl}/collections/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))

      return [...staticPages, ...categoryPages]
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  // Return static pages if categories fetch fails
  return staticPages
}
