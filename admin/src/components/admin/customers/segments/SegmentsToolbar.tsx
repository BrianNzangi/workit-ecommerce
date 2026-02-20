import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';

interface SegmentsToolbarProps {
    searchTerm: string;
    visibleCount: number;
    onSearchTermChange: (value: string) => void;
}

export function SegmentsToolbar({
    searchTerm,
    visibleCount,
    onSearchTermChange,
}: SegmentsToolbarProps) {
    return (
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                    value={searchTerm}
                    onChange={(event) => onSearchTermChange(event.target.value)}
                    placeholder="Search segments"
                    className="pl-9"
                />
            </div>
            <Badge variant="secondary" className="w-fit bg-gray-100 text-gray-700">
                {visibleCount} segment{visibleCount !== 1 ? 's' : ''}
            </Badge>
        </div>
    );
}
