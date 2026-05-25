import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface PagesToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    totalCount: number;
    filteredCount: number;
}

export function PagesToolbar({
    searchTerm,
    onSearchChange,
    totalCount,
    filteredCount,
}: PagesToolbarProps) {
    const isFiltered = searchTerm.trim().length > 0;
    const showCounts = isFiltered && totalCount !== filteredCount;

    return (
        <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Search pages..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="rounded-lg bg-gray-50 pl-9 ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                />
            </div>

            {showCounts && (
                <span className="text-sm text-gray-500">
                    {filteredCount} of {totalCount} pages
                </span>
            )}
        </div>
    );
}
