import { Search, ChevronDown, ChevronRight, ListCollapse } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface CollectionsToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    collectionCount: number;
    filteredCount: number;
}

export function CollectionsToolbar({
    searchTerm,
    onSearchChange,
    onExpandAll,
    onCollapseAll,
    collectionCount,
    filteredCount,
}: CollectionsToolbarProps) {
    const isFiltered = searchTerm.trim().length > 0;
    const showCounts = isFiltered && collectionCount !== filteredCount;

    return (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    placeholder="Search collections..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="flex items-center gap-2">
                {showCounts && (
                    <span className="text-sm text-gray-500">
                        {filteredCount} of {collectionCount} collections
                    </span>
                )}

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onExpandAll}
                        className="h-7 gap-1 text-xs"
                    >
                        <ChevronDown className="h-3.5 w-3.5" />
                        Expand
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCollapseAll}
                        className="h-7 gap-1 text-xs"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                        Collapse
                    </Button>
                </div>
            </div>
        </div>
    );
}
