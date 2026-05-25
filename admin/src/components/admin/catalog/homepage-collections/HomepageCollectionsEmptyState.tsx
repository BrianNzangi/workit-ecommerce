import Link from 'next/link';
import { Star, Plus, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HomepageCollectionsEmptyStateProps {
    searchTerm?: string;
}

export function HomepageCollectionsEmptyState({ searchTerm }: HomepageCollectionsEmptyStateProps) {
    const isSearch = Boolean(searchTerm?.trim());

    return (
        <Card className="border-gray-200">
            <CardContent className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    {isSearch ? (
                        <Search className="h-8 w-8 text-gray-400" />
                    ) : (
                        <Star className="h-8 w-8 text-gray-400" />
                    )}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-gray-900">
                    {isSearch ? 'No results found' : 'No homepage collections yet'}
                </h3>
                <p className="mb-6 max-w-sm text-sm text-gray-500">
                    {isSearch
                        ? `No collections match "${searchTerm}". Try a different search term.`
                        : 'Create your first homepage collection to feature products on your homepage.'}
                </p>
                {!isSearch && (
                    <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                        <Link href="/admin/homepage-collections/new">
                            <Plus className="h-4 w-4" />
                            Add Collection
                        </Link>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
