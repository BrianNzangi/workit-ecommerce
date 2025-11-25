import { NextResponse } from "next/server";
import { vendureClient } from "@/lib/vendure-client";
import { gql } from "@apollo/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  count: number;
  description?: string;
  children?: Category[];
}

// GraphQL query to fetch collections (categories in Vendure)
const GET_COLLECTIONS = gql`
  query GetCollections {
    collections {
      items {
        id
        name
        slug
        description
        parent {
          id
        }
        productVariants {
          totalItems
        }
      }
    }
  }
`;

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
    // Fetch all collections from Vendure
    const { data } = await vendureClient.query({
      query: GET_COLLECTIONS,
    }) as { data: any };

    const collections = data.collections.items;

    // Transform Vendure collections to category format
    const categoryMap: Record<string, Category> = {};
    collections.forEach((col: any) => {
      categoryMap[col.id] = {
        id: col.id,
        name: col.name,
        slug: col.slug,
        parent: col.parent?.id,
        count: col.productVariants?.totalItems || 0,
        description: col.description,
        children: [],
      };
    });

    // Nest children correctly
    const nestedCategories: Category[] = [];
    collections.forEach((col: any) => {
      if (col.parent?.id && categoryMap[col.parent.id]) {
        categoryMap[col.parent.id].children!.push(categoryMap[col.id]);
      } else {
        nestedCategories.push(categoryMap[col.id]);
      }
    });

    // Cache the result
    cachedCategories = nestedCategories;
    cacheTimestamp = now;

    return NextResponse.json(nestedCategories);
  } catch (error) {
    console.error("Error fetching categories from Vendure:", error);
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json([]);
  }
}
