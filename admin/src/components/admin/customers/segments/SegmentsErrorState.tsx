import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SegmentsErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function SegmentsErrorState({ error, onRetry }: SegmentsErrorStateProps) {
    return (
        <Card className="border-red-200 bg-red-50 shadow-xs">
            <CardContent className="py-12 text-center">
                <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-500" />
                <p className="mb-4 text-sm font-medium text-red-700">{error}</p>
                <Button variant="outline" onClick={onRetry} className="border-red-300 text-red-700 hover:bg-red-100">
                    Retry
                </Button>
            </CardContent>
        </Card>
    );
}
