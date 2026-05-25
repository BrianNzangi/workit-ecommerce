import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BrandsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    totalCount: number;
    filteredCount: number;
}

export function BrandsToolbar({
    searchTerm,
    onSearchChange,
    totalCount,
    filteredCount,
}: BrandsToolbarProps) {
    const isFiltered = searchTerm.trim().length > 0;
    const showCounts = isFiltered && totalCount !== filteredCount;

    return (
        <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Search brands..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            {showCounts && (
                <span className="text-sm text-gray-500">
                    {filteredCount} of {totalCount} brands
                </span>
            )}
        </div>
    );
}
