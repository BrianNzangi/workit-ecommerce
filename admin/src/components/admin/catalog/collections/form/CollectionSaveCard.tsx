import Link from 'next/link';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CollectionSaveCardProps {
    loading: boolean;
    uploading: boolean;
    submitLabel?: string;
}

export function CollectionSaveCard({
    loading,
    uploading,
    submitLabel = 'Save Collection',
}: CollectionSaveCardProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="space-y-3 p-6">
                <Button
                    type="submit"
                    disabled={loading || uploading}
                    className="h-11 w-full bg-primary-900 text-white hover:bg-primary-800"
                >
                    <Save className="h-4 w-4" />
                    {uploading ? 'Uploading...' : loading ? 'Saving...' : submitLabel}
                </Button>

                <Button type="button" asChild variant="outline" className="w-full">
                    <Link href="/admin/collections">Cancel</Link>
                </Button>
            </CardContent>
        </Card>
    );
}
