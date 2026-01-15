/**
 * Store API Client
 * 
 * Unified API client for accessing storefront data through GraphQL.
 * All storefront data (collections, banners, products, cart, orders) is fetched
 * through the GraphQL endpoint: POST /api/store
 * 
 * This is used by CLIENT-SIDE components, so it uses NEXT_PUBLIC_API_URL
 * to call Next.js API routes, which then proxy to the backend.
 */

import { graphqlRequest } from './graphql-client';

/**
 * Collection Interface
 */
export interface Collection {
    id: string | number;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    children?: Collection[];
}

/**
 * Banner Interface
 */
export interface Banner {
    id: string | number;
    title: string;
    slug: string;
    image: string;
    mobileImage?: string;
    link?: string;
    position?: string;
    sortOrder?: number;
}

/**
 * Category Interface
 */
export interface Category {
    id: string | number;
    name: string;
    slug: string;
    image?: string;
    children?: Category[];
}

/**
 * Homepage Collection Interface
 */
export interface HomeCollection {
    id: string | number;
    title: string;
    slug: string;
    products?: any[];
}

/**
 * GraphQL Queries
 */
const COLLECTIONS_QUERY = `
  query GetCollections {
    collections {
      id
      name
      slug
      description
      image
      children {
        id
        name
        slug
        image
      }
    }
  }
`;

const BANNERS_QUERY = `
  query GetBanners {
    banners {
      id
      title
      slug
      image
      mobileImage
      link
      position
      sortOrder
    }
  }
`;

const CATEGORIES_QUERY = `
  query GetCategories {
    categories {
      id
      name
      slug
      image
      children {
        id
        name
        slug
        image
      }
    }
  }
`;

const HOME_COLLECTIONS_QUERY = `
  query GetHomeCollections {
    homeCollections {
      id
      title
      slug
      products {
        id
        name
        slug
        price
        image
      }
    }
  }
`;

/**
 * Get collections from GraphQL API
 * 
 * @returns Promise<Collection[]>
 */
export async function getCollections(): Promise<Collection[]> {
    try {
        const { data, errors } = await graphqlRequest({
            query: COLLECTIONS_QUERY,
        });

        if (errors && errors.length > 0) {
            console.error('GraphQL errors fetching collections:', errors);
            return [];
        }

        return data?.collections || [];
    } catch (error) {
        console.error('Error fetching collections:', error);
        return [];
    }
}

/**
 * Get banners from GraphQL API
 * 
 * @returns Promise<Banner[]>
 */
export async function getBanners(): Promise<Banner[]> {
    try {
        const { data, errors } = await graphqlRequest({
            query: BANNERS_QUERY,
        });

        if (errors && errors.length > 0) {
            console.error('GraphQL errors fetching banners:', errors);
            return [];
        }

        return data?.banners || [];
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

/**
 * Get categories from GraphQL API
 * 
 * @returns Promise<Category[]>
 */
export async function getCategories(): Promise<Category[]> {
    try {
        const { data, errors } = await graphqlRequest({
            query: CATEGORIES_QUERY,
        });

        if (errors && errors.length > 0) {
            console.error('GraphQL errors fetching categories:', errors);
            return [];
        }

        return data?.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

/**
 * Get homepage collections from GraphQL API
 * 
 * @returns Promise<HomeCollection[]>
 */
export async function getHomeCollections(): Promise<HomeCollection[]> {
    try {
        const { data, errors } = await graphqlRequest({
            query: HOME_COLLECTIONS_QUERY,
        });

        if (errors && errors.length > 0) {
            console.error('GraphQL errors fetching home collections:', errors);
            return [];
        }

        return data?.homeCollections || [];
    } catch (error) {
        console.error('Error fetching home collections:', error);
        return [];
    }
}
