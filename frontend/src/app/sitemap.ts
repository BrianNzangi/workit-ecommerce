import { MetadataRoute } from "next";
import {
  getBlogSitemapEntries,
  getCollectionSitemapEntries,
  getProductSitemapEntries,
  getStaticSitemapEntries,
} from "@/lib/seo/site-indexing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticPages, productPages, collectionPages, blogPages] = await Promise.all([
    Promise.resolve(getStaticSitemapEntries()),
    getProductSitemapEntries(),
    getCollectionSitemapEntries(),
    getBlogSitemapEntries(),
  ]);

  return [...staticPages, ...collectionPages, ...productPages, ...blogPages].map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified ? new Date(entry.lastModified) : new Date(),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}
