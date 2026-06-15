'use client';

import { useQuery } from '@tanstack/react-query';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    parentId?: string | null;
    children?: Category[];
}

interface Brand {
    id: string | number;
    name: string;
    slug: string;
    count: number;
    image?: { src: string };
    link?: string;
}

interface Tag {
    id: string | number;
    name: string;
    count: number;
}

interface FiltersResponse {
    categories: Category[];
    brands: Brand[];
    tags: Tag[];
}

async function fetchCollections(includeChildren?: boolean): Promise<Category[]> {
    const params = includeChildren ? '?includeChildren=true' : '';
    const res = await fetch(`/api/collections${params}`);
    if (!res.ok) throw new Error('Failed to fetch collections');
    return res.json();
}

function processCategories(rawData: any[]): Category[] {
    const process = (cats: any[]): Category[] =>
        cats.map((cat) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            count: cat._count?.products || 0,
            parentId: cat.parentId,
            children: cat.children ? process(cat.children) : [],
        }));
    return process(rawData);
}

async function fetchFilterData(collectionSlug?: string): Promise<FiltersResponse> {
    const brandsUrl = collectionSlug
        ? `/api/brands?collection=${collectionSlug}`
        : '/api/brands';

    const [categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/collections?includeChildren=true', { cache: 'no-store' }),
        fetch(brandsUrl, { cache: 'no-store' }),
    ]);

    let categoriesData: Category[] = [];
    if (categoriesRes.ok) {
        const raw = await categoriesRes.json();
        categoriesData = processCategories(raw).filter((c) => !c.parentId);
    }

    let brandsData: Brand[] = [];
    if (brandsRes.ok) {
        const brands = await brandsRes.json();
        brandsData = brands
            .map((b: any) => ({
                id: b.id,
                name: b.name,
                slug: b.slug,
                count: b.count || 0,
            }))
            .filter((b: Brand) => b.count > 0);
    }

    return { categories: categoriesData, brands: brandsData, tags: [] };
}

export function useCollections(includeChildren = false) {
    return useQuery({
        queryKey: ['collections', includeChildren],
        queryFn: () => fetchCollections(includeChildren),
        staleTime: 10 * 60 * 1000,
    });
}

export function useFilterData(collectionSlug?: string) {
    return useQuery({
        queryKey: ['filter-data', collectionSlug],
        queryFn: () => fetchFilterData(collectionSlug),
        staleTime: 10 * 60 * 1000,
    });
}
