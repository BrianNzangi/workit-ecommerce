import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BannerFormErrorProps {
    message?: string | null;
}

export function BannerFormError({ message }: BannerFormErrorProps) {
    if (!message) return null;

    return (
        <Card className="mb-6 border-red-200 bg-red-50 shadow-none">
            <CardContent className="flex items-start gap-2 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-sm font-medium text-red-700">{message}</p>
            </CardContent>
        </Card>
    );
}
