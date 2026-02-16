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
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
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

  // Fetch products
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const productsRes = await fetch(`${baseUrl}/api/products?per_page=1000`, {
      next: { revalidate: 3600 }
    });

    if (productsRes.ok) {
      const data = await productsRes.json();
      const products = data.products || [];
      productPages = products.map((p: any) => ({
        url: `${baseUrl}/deal-details/${p.slug}`,
        lastModified: new Date(p.updatedAt || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

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

      // Fetch blog posts
      let blogPages: MetadataRoute.Sitemap = [];
      try {
        const blogRes = await fetch(`${baseUrl}/api/blog`, {
          next: { revalidate: 3600 }
        });

        if (blogRes.ok) {
          const posts = await blogRes.json();
          blogPages = posts.map((p: any) => ({
            url: `${baseUrl}/blog/${p.slug}`,
            lastModified: new Date(p.updatedAt || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          }));
        }
      } catch (error) {
        console.error('Error fetching blog posts for sitemap:', error);
      }

      return [...staticPages, ...categoryPages, ...productPages, ...blogPages]
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error)
  }

  // Return static pages and products (if any) if categories fetch fails
  return [...staticPages, ...productPages]
}
