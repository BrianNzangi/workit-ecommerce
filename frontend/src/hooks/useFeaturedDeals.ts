import { useQuery } from '@tanstack/react-query';

export interface FeaturedDeal {
    id: string;
    title: string;
    productId: string;
    discount: number;
    dealType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BOGO' | 'FREE_SHIPPING';
    startDate: string;
    endDate: string;
}

interface UseFeaturedDealsReturn {
    deals: FeaturedDeal[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

async function fetchFeaturedDeals(): Promise<FeaturedDeal[]> {
    const response = await fetch('/api/store/featured-deals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.deals || [];
}

export function useFeaturedDeals(): UseFeaturedDealsReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['featured-deals'],
        queryFn: fetchFeaturedDeals,
        staleTime: 5 * 60 * 1000,
    });

    return {
        deals: data || [],
        loading: isLoading,
        error: error as Error | null,
        refetch: async () => { await refetch(); },
    };
}
