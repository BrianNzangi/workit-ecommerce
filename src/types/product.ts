// ✅ WooCommerce attribute (both product + variation use this)
export interface ProductAttribute {
  id: number
  name: string
  slug: string
  options: string[]        // For parent products (array of options)
  option?: string          // For variations (single option string)
}

export interface ProductTag {
  id: number
  name: string
  slug: string
}

export interface ProductFilter {
  attribute?: string;
  terms?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface ProductCoupon {
  id: number
  code: string
  discount_type: string
  amount: string
}

// ✅ Variation type returned by WooCommerce
export interface ProductVariation {
  id: number
  price: string
  regular_price: string
  sale_price: string
  stock_status: "instock" | "outofstock" | "onbackorder"
  image?: { id?: number; src: string }
  attributes: {
    id: number
    name: string
    option: string          // Variations only expose one option per attribute
  }[]
}

// ✅ Main Product type
export interface Product {
  id: number
  name: string
  slug: string
  type: "simple" | "variable" | string
  link: string
  price: string
  regular_price?: string
  sale_price?: string
  image?: string
  images?: { id?: number; src?: string; url?: string; altText?: string }[]
  attributes?: ProductAttribute[]
  tags?: ProductTag[]
  coupons?: ProductCoupon[]
  stock_status?: "instock" | "outofstock" | "onbackorder"
  on_sale?: boolean
  brand?: string
  description?: string
  short_description?: string
  categories?: { id: number; name: string; slug: string }[]

  // ✅ Variations only if type === "variable"
  variations?: ProductVariation[]

  // ✅ Vendure variants (for compatibility with Vendure backend)
  variants?: { id: string | number;[key: string]: any }[]

  // ✅ Shipping method (for express shipping badges)
  shippingMethod?: {
    id: string
    code: string
    name: string
    description?: string
    isExpress: boolean
  }

  // ✅ Product condition (NEW, REFURBISHED, etc.)
  condition?: string

  // ✅ UI helpers
  selectedVariationId?: number
  selectedVariationPrice?: number
  selectedVariationOriginalPrice?: number
}

export interface HomepageCollection {
  title: string
  slug: string
  products: Product[]
}