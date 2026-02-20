import { UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SegmentsHeaderProps {
    totalSegments: number;
}

export function SegmentsHeader({ totalSegments }: SegmentsHeaderProps) {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
                <Badge variant="outline" className="border-primary-200 bg-primary-50 text-primary-900">
                    {totalSegments}
                </Badge>
            </div>
            <p className="mt-2 text-gray-600">
                Automatically generated customer groups based on account and order behavior.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs text-primary-900">
                <UsersRound className="h-3.5 w-3.5" />
                Auto-updates from live customer and order data
            </div>
        </div>
    );
}
