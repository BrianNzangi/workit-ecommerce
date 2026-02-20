import { Card, CardContent } from '@/components/ui/card';

export function AssetsLoadingState() {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="p-8">
                <p className="text-center text-gray-500">Loading assets...</p>
            </CardContent>
        </Card>
    );
}
