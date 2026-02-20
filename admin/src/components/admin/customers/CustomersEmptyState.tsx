import Link from 'next/link';
import { Users, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CustomersEmptyStateProps {
    searchTerm?: string;
}

export function CustomersEmptyState({ searchTerm }: CustomersEmptyStateProps) {
    const hasSearch = Boolean(searchTerm?.trim());

    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="py-14 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {hasSearch ? 'No customers match your search' : 'No customers yet'}
                </h3>
                <p className="mb-6 text-gray-600">
                    {hasSearch
                        ? 'Try a different keyword, email, or phone.'
                        : 'Customer accounts will appear here when they register or purchase.'}
                </p>
                {!hasSearch ? (
                    <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                        <Link href="/admin/customers/new">
                            <Plus className="h-4 w-4" />
                            Create Your First Customer
                        </Link>
                    </Button>
                ) : null}
            </CardContent>
        </Card>
    );
}
