import { Card, CardContent } from '@/components/ui/card';

export function CollectionsLoadingState() {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="p-8">
                <p className="text-center text-gray-500">Loading collections...</p>
            </CardContent>
        </Card>
    );
}
