import { Variant } from './variant';

// Product filter for search/filtering
export interface ProductFilter {
  attribute?: string;
  terms?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
}

// Category/Collection type
export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

// Main Product type (matches custom Prisma backend)
export interface Product {
  // Core fields (from Prisma Product model)
  id: string; // UUID string
  name: string;
  slug: string;
  description?: string;
  short_description?: string;

  // Pricing (from first variant or product.salePrice)
  price: number; // Price in KES
  compareAtPrice?: number; // Original price for discount calculation

  // Images (from ProductAsset relation)
  image?: string;
  images?: {
    id: string;
    url: string;
    altText?: string;
    position?: number;
  }[];

  // Relations
  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };

  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];

  // Custom fields
  condition?: 'NEW' | 'REFURBISHED';

  // Shipping method (for express shipping badges)
  shippingMethod?: {
    id: string;
    code: string;
    name: string;
    description?: string;
    isExpress: boolean;
  };

  // Variants (from ProductVariant relation)
  variants?: Variant[];

  // Standardized fields for Single-Product Mode (Normalized per product)
  variantId?: string;
  stockOnHand?: number;
  canBuy?: boolean;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

// Homepage collection type
export interface HomepageCollection {
  title: string;
  slug: string;
  products: Product[];
}