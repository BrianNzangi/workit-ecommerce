// src/types/collection.ts

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;           // 0 if top-level
  count: number;            // number of products in this category
  description?: string;     // category description from WooCommerce
  children?: Category[];    // nested subcategories
}

// Existing types
export interface ProductAttribute {
  id: number;
  name: string;
  options: string[];
  slug: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  image?: { src: string };
  link?: string;
}

export interface CollectionProduct {
  id: number;
  title: string;
  slug: string;
  link: string;
  price: string;
  regular_price: string;
  image: string;
  attributes?: ProductAttribute[];
  tags?: { id: number; name: string; slug: string }[];
  coupons?: { id: number; code: string; discount_type: string; amount: string }[];
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  on_sale?: boolean;
  brand?: Brand;
}

export interface HomepageCollection {
  title: string;
  slug: string;
  products: CollectionProduct[];
  brands?: Brand[];
}
