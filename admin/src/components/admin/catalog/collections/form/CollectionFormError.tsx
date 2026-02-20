import { Card, CardContent } from '@/components/ui/card';

interface CollectionFormErrorProps {
    message: string;
}

export function CollectionFormError({ message }: CollectionFormErrorProps) {
    if (!message) return null;

    return (
        <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{message}</CardContent>
        </Card>
    );
}
