// E:\Projects\workit\src\app\api\categories\route.ts
import { NextResponse } from "next/server";
import woo from "@/lib/woocommerce";

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  count: number;
  description?: string;
  children?: Category[];
}

// In-memory cache
let cachedCategories: Category[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const now = Date.now();

  // Return cached data if valid
  if (cachedCategories && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json(cachedCategories);
  }

  try {
    // Fetch all categories from WooCommerce (per_page may need to be increased if >100 categories)
    const res = await woo.get("products/categories", { params: { per_page: 100 } });
    const flatCategories: Category[] = res.data;

    // Map ID → Category with empty children array
    const categoryMap: Record<number, Category> = {};
    flatCategories.forEach((cat) => {
      categoryMap[cat.id] = { ...cat, children: [] };
    });

    // Nest children correctly
    const nestedCategories: Category[] = [];
    flatCategories.forEach((cat) => {
      if (cat.parent && categoryMap[cat.parent]) {
        categoryMap[cat.parent].children!.push(categoryMap[cat.id]);
      } else {
        nestedCategories.push(categoryMap[cat.id]);
      }
    });

    // Cache the result
    cachedCategories = nestedCategories;
    cacheTimestamp = now;

    return NextResponse.json(nestedCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
