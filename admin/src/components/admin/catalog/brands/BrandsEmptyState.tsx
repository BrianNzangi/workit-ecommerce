import Link from 'next/link';
import { Tag, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BrandsEmptyStateProps {
    searchTerm?: string;
}

export function BrandsEmptyState({ searchTerm }: BrandsEmptyStateProps) {
    const isSearch = Boolean(searchTerm?.trim());

    return (
        <Card className="border-gray-200">
            <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    {isSearch ? (
                        <Search className="h-8 w-8 text-gray-400" />
                    ) : (
                        <Tag className="h-8 w-8 text-gray-400" />
                    )}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    {isSearch ? 'No results found' : 'No brands yet'}
                </h3>
                <p className="mb-6 max-w-sm text-sm text-gray-500">
                    {isSearch
                        ? `No brands match "${searchTerm}". Try a different search term.`
                        : 'Create your first brand to start organizing your products.'}
                </p>
                {!isSearch && (
                    <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                        <Link href="/admin/brands/new">
                            <Plus className="h-4 w-4" />
                            Add Brand
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
