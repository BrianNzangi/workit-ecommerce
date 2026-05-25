import { FileText, Search } from 'lucide-react';

interface PagesEmptyStateProps {
    searchTerm?: string;
}

export function PagesEmptyState({ searchTerm }: PagesEmptyStateProps) {
    const isSearch = Boolean(searchTerm?.trim());

    return (
        <div className="rounded-xl bg-white py-16 shadow-sm">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                    {isSearch ? (
                        <Search className="h-7 w-7 text-gray-300" />
                    ) : (
                        <FileText className="h-7 w-7 text-gray-300" />
                    )}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    {isSearch ? 'No results found' : 'No pages configured'}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {isSearch
                        ? `No pages match "${searchTerm}". Try a different search term.`
                        : 'Pages are pre-configured. Check back later.'}
                </p>
            </div>
        </div>
    );
}
