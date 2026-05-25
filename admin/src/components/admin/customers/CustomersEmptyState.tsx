import Link from 'next/link';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomersEmptyStateProps {
    searchTerm?: string;
}

export function CustomersEmptyState({ searchTerm }: CustomersEmptyStateProps) {
    const hasSearch = Boolean(searchTerm?.trim());

    return (
        <div className="rounded bg-white py-16">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    <Users className="h-6 w-6 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    {hasSearch ? 'No results found' : 'No customers yet'}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {hasSearch
                        ? `No customers match "${searchTerm}". Try a different search term.`
                        : 'Customer accounts will appear here when they register or purchase.'}
                </p>
                {!hasSearch && (
                    <Button asChild className="mt-6 rounded bg-primary-900 text-white hover:bg-primary-800">
                        <Link href="/admin/customers/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Customer
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
