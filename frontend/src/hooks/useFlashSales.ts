import { useQuery } from '@tanstack/react-query';

export interface FlashSale {
    id: string;
    title: string;
    discount: number;
    productIds: string[];
    startDate: string;
    endDate: string;
}

interface UseFlashSalesReturn {
    sales: FlashSale[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
}

async function fetchFlashSales(): Promise<FlashSale[]> {
    const response = await fetch('/api/store/flash-sales', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sales || [];
}

export function useFlashSales(): UseFlashSalesReturn {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['flash-sales'],
        queryFn: fetchFlashSales,
        staleTime: 5 * 60 * 1000,
    });

    return {
        sales: data || [],
        loading: isLoading,
        error: error as Error | null,
        refetch: async () => { await refetch(); },
    };
}
