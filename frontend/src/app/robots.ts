import { MetadataRoute } from "next";
import { getCanonicalSiteUrl } from "@/lib/seo/site-indexing";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/cart", "/checkout", "/login", "/dashboard", "/orders"],
    },
    sitemap: `${getCanonicalSiteUrl()}/sitemap.xml`,
  };
}
