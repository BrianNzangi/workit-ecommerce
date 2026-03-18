'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const ReactQueryDevtools =
    process.env.NODE_ENV === 'development'
        ? dynamic(
            () => import('@tanstack/react-query-devtools').then((mod) => mod.ReactQueryDevtools),
            { ssr: false }
        )
        : () => null;

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Default caching options
                        staleTime: 1000 * 60 * 5, // 5 minutes (matches your backend revalidate)
                        gcTime: 1000 * 60 * 60 * 24, // 24 hours
                        refetchOnWindowFocus: false, // Avoid excessive refetching
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
