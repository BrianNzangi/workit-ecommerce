import { useQuery } from '@tanstack/react-query';

export interface ClearanceDeal {
    id: string;
    title: string;
    productId: string;
    discount: number;
    type: string;
    deal: 'FLASH_SALE' | 'FEATURED_DEAL';
    startDate: string;
    endDate: string;
}

interface UseClearanceDealsReturn {
    deals: ClearanceDeal[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

async function fetchClearanceDeals(): Promise<ClearanceDeal[]> {
    const response = await fetch('/api/store/clearance-deals', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.deals || [];
}

export function useClearanceDeals(): UseClearanceDealsReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['clearance-deals'],
        queryFn: fetchClearanceDeals,
        staleTime: 5 * 60 * 1000,
    });

    return {
        deals: data || [],
        loading: isLoading,
        error: error as Error | null,
        refetch: async () => { await refetch(); },
    };
}
