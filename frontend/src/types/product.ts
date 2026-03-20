import { Variant } from './variant';

export interface ProductCampaign {
  id: string;
  name: string;
  slug: string;
  type: string;
  discountType?: string | null;
  status: string;
  startDate?: string;
  endDate?: string | null;
  couponCode?: string | null;
  discountValue?: number | null;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usagePerCustomer?: number | null;
  badgeText?: string | null;
  promotionalPrice?: number | null;
  savingsAmount?: number | null;
  savingsPercent?: number | null;
  isActiveNow?: boolean;
}

export interface ProductPromotion {
  id: string;
  name: string;
  slug: string;
  type: string;
  discountType?: string | null;
  status: string;
  startDate?: string;
  endDate?: string | null;
  couponCode?: string | null;
  discountValue?: number | null;
  minPurchaseAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usagePerCustomer?: number | null;
  badgeText?: string | null;
  promotionalPrice?: number | null;
  savingsAmount?: number | null;
  savingsPercent?: number | null;
  isActiveNow?: boolean;
  basePrice?: number;
}

// Product filter for search/filtering
export interface ProductFilter {
  attribute?: string;
  terms?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  inStock?: boolean;
  shippingMethodId?: string;
  brand?: number[];
}

// Category/Collection type
export interface Category {
  id: string;
  name: string;
  slug: string;
  count?: number;
}

// Main Product type (aligned with new storefront API)
export interface Product {
  // Core fields
  id: string; // UUID string
  name: string;
  slug: string;
  description?: string;
  short_description?: string;

  // Pricing (from backend API)
  price: number; // salePrice from backend
  compareAtPrice?: number; // originalPrice from backend
  salePrice?: number; // Alias for price
  originalPrice?: number; // Alias for compareAtPrice

  // Stock
  stockOnHand?: number;
  inStock?: boolean;

  // Images (from ProductAsset relation)
  image?: string; // Alias for featuredImage
  featuredImage?: string; // From backend API
  images?: {
    id: string;
    url: string;
    source?: string; // Backend uses 'source'
    altText?: string;
    position?: number;
    featured?: boolean;
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

  collections?: {
    id: string;
    name: string;
    slug: string;
  }[];

  campaigns?: ProductCampaign[];
  activePromotion?: ProductPromotion | null;

  campaignType?: string | null;
  campaignTypes?: string[];
  discountType?: string | null;
  discountTypes?: string[];

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
