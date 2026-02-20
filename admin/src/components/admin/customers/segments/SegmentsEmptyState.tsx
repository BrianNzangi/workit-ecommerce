import { FilterX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SegmentsEmptyState() {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="py-14 text-center">
                <FilterX className="mx-auto mb-4 h-14 w-14 text-gray-300" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No segments found</h3>
                <p className="text-gray-600">Try using a different keyword.</p>
            </CardContent>
        </Card>
    );
}
