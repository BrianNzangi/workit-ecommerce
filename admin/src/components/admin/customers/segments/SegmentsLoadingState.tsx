import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function SegmentsLoadingState() {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary-900" />
                <span className="ml-3 font-medium text-gray-600">Loading segments...</span>
            </CardContent>
        </Card>
    );
}
