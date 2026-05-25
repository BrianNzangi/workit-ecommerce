import { ShoppingCart, Search } from 'lucide-react';

interface OrdersEmptyStateProps {
    searchTerm?: string;
}

export function OrdersEmptyState({ searchTerm }: OrdersEmptyStateProps) {
    const isSearch = Boolean(searchTerm?.trim());

    return (
        <div className="rounded bg-white py-16 shadow-sm">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    {isSearch ? (
                        <Search className="h-6 w-6 text-gray-300" />
                    ) : (
                        <ShoppingCart className="h-6 w-6 text-gray-300" />
                    )}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    {isSearch ? 'No results found' : 'No orders yet'}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {isSearch
                        ? `No orders match "${searchTerm}". Try a different search term.`
                        : 'Orders will appear here when customers make purchases.'}
                </p>
            </div>
        </div>
    );
}
