import { UsersRound } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface SegmentsHeaderProps {
    totalSegments: number;
}

export function SegmentsHeader({ totalSegments }: SegmentsHeaderProps) {
    return (
        <div className="mb-6 bg-white rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Segments</h1>
                <Badge variant="outline" className="border-primary-200 bg-primary-50 text-primary-900">
                    {totalSegments}
                </Badge>
            </div>
        </div>
    );
}
