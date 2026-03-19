import type { MetadataRoute } from "next";
import { fetchCollections } from "@/lib/collections-server";
import { SITE_CONFIG } from "@/lib/meta";
import { proxyFetch } from "@/lib/proxy-utils";
import type { Collection } from "@/types/collections";

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY?.trim() || "1362f663ee08495c823032577fefb4db";
export const INDEXNOW_KEY_FILENAME = `${INDEXNOW_KEY}.txt`;

export type IndexingScope = "static" | "products" | "collections" | "blogs" | "all";

export interface IndexableUrlRecord {
  url: string;
  lastModified?: string | Date | null;
  changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority?: number;
}

const STATIC_PAGES: Array<{
  path: string;
  changeFrequency: NonNullable<IndexableUrlRecord["changeFrequency"]>;
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/collections", changeFrequency: "weekly", priority: 0.95 },
  { path: "/blog", changeFrequency: "daily", priority: 0.9 },
  { path: "/about-workit", changeFrequency: "monthly", priority: 0.8 },
  { path: "/help-center", changeFrequency: "monthly", priority: 0.75 },
  { path: "/reviews", changeFrequency: "monthly", priority: 0.7 },
  { path: "/careers", changeFrequency: "monthly", priority: 0.65 },
  { path: "/privacy-policy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/shipping-policy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms-of-service", changeFrequency: "monthly", priority: 0.5 },
  { path: "/returns-refunds-policy", changeFrequency: "monthly", priority: 0.5 },
  { path: "/advertising-policy", changeFrequency: "monthly", priority: 0.45 },
];

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalhostUrl(value: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

export function getCanonicalSiteUrl() {
  const explicitUrl =
    process.env.INDEXNOW_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_FRONTEND_BASE_URL?.trim() ||
    "";

  if (process.env.NODE_ENV === "production") {
    if (!explicitUrl || isLocalhostUrl(explicitUrl)) {
      return "https://workit.co.ke";
    }
  }

  return trimTrailingSlash(explicitUrl || SITE_CONFIG.url);
}

export function getIndexNowKeyLocation() {
  return `${getCanonicalSiteUrl()}/${INDEXNOW_KEY_FILENAME}`;
}

export function toAbsoluteSiteUrl(pathOrUrl: string) {
  if (!pathOrUrl) return getCanonicalSiteUrl();
  if (/^https?:\/\//i.test(pathOrUrl)) return trimTrailingSlash(pathOrUrl);
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getCanonicalSiteUrl()}${path}`;
}

export function normalizeIndexNowUrls(urls: string[]) {
  const allowedHost = new URL(getCanonicalSiteUrl()).host;
  const normalized = new Set<string>();

  for (const value of urls) {
    if (!value) continue;
    const absoluteUrl = toAbsoluteSiteUrl(value);
    const parsed = new URL(absoluteUrl);
    if (parsed.host !== allowedHost) continue;
    normalized.add(parsed.toString());
  }

  return Array.from(normalized);
}

export function getStaticSitemapEntries(): IndexableUrlRecord[] {
  const now = new Date();

  return STATIC_PAGES.map((page) => ({
    url: toAbsoluteSiteUrl(page.path),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));
}

export async function getProductSitemapEntries(): Promise<IndexableUrlRecord[]> {
  try {
    const response = await proxyFetch("/store/products?limit=1000&offset=0", {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const products = data.products || [];

    return products
      .filter((product: any) => product.slug)
      .map((product: any) => ({
        url: toAbsoluteSiteUrl(`/deal-details/${product.slug}`),
        lastModified: product.updatedAt || product.createdAt || null,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Error fetching products for indexing:", error);
    return [];
  }
}

function flattenCollectionEntries(
  collections: Collection[],
  parentSegments: string[] = [],
): IndexableUrlRecord[] {
  const entries: IndexableUrlRecord[] = [];

  for (const collection of collections) {
    if (!collection.enabled || !collection.slug) continue;

    const segments = [...parentSegments, collection.slug];
    entries.push({
      url: toAbsoluteSiteUrl(`/collections/${segments.join("/")}`),
      lastModified: collection.updatedAt || collection.createdAt || null,
      changeFrequency: "weekly",
      priority: segments.length === 1 ? 0.85 : 0.75,
    });

    if (collection.children?.length) {
      entries.push(...flattenCollectionEntries(collection.children, segments));
    }
  }

  return entries;
}

export async function getCollectionSitemapEntries(): Promise<IndexableUrlRecord[]> {
  try {
    const collections = await fetchCollections({
      includeChildren: true,
      includeAssets: false,
      take: 1000,
    });

    return flattenCollectionEntries(collections);
  } catch (error) {
    console.error("Error fetching collections for indexing:", error);
    return [];
  }
}

export async function getBlogSitemapEntries(): Promise<IndexableUrlRecord[]> {
  try {
    const response = await proxyFetch("/marketing/blog?limit=200&offset=0", {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const payload = await response.json();
    const blogs = Array.isArray(payload) ? payload : (payload.blogs || []);

    return blogs
      .filter((blog: any) => blog.slug)
      .map((blog: any) => ({
        url: toAbsoluteSiteUrl(`/blog/${blog.slug}`),
        lastModified: blog.updatedAt || blog.publishedAt || blog.createdAt || null,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error("Error fetching blogs for indexing:", error);
    return [];
  }
}

export async function getUrlsForScopes(scopes: IndexingScope[]) {
  const expandedScopes = scopes.includes("all")
    ? (["static", "products", "collections", "blogs"] as IndexingScope[])
    : scopes;

  const [staticEntries, productEntries, collectionEntries, blogEntries] = await Promise.all([
    expandedScopes.includes("static") ? Promise.resolve(getStaticSitemapEntries()) : Promise.resolve([]),
    expandedScopes.includes("products") ? getProductSitemapEntries() : Promise.resolve([]),
    expandedScopes.includes("collections") ? getCollectionSitemapEntries() : Promise.resolve([]),
    expandedScopes.includes("blogs") ? getBlogSitemapEntries() : Promise.resolve([]),
  ]);

  return normalizeIndexNowUrls([
    ...staticEntries.map((entry) => entry.url),
    ...productEntries.map((entry) => entry.url),
    ...collectionEntries.map((entry) => entry.url),
    ...blogEntries.map((entry) => entry.url),
  ]);
}
