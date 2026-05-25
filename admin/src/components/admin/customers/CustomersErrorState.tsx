import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomersErrorStateProps {
    error: string;
    onRetry: () => void;
}

export function CustomersErrorState({ error, onRetry }: CustomersErrorStateProps) {
    return (
        <div className="rounded bg-red-50 py-12">
            <div className="flex flex-col items-center text-center">
                <AlertTriangle className="mb-3 h-10 w-10 text-red-500" />
                <p className="mb-4 text-sm font-medium text-red-700">{error}</p>
                <Button variant="outline" onClick={onRetry} className="rounded border-red-300 text-red-700 hover:bg-red-100">
                    Retry
                </Button>
            </div>
        </div>
    );
}
