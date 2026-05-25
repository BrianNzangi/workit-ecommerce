'use client';

import { useQuery } from '@tanstack/react-query';
import type { Blog } from '@/types/blog';

const BLOGS_KEY = ['blogs'] as string[];

async function fetchBlogs(): Promise<Blog[]> {
    const res = await fetch('/api/blogs');
    const data = await res.json();
    return data;
}

export function useBlogs() {
    return useQuery({
        queryKey: BLOGS_KEY,
        queryFn: fetchBlogs,
        staleTime: 10 * 60 * 1000,
    });
}
