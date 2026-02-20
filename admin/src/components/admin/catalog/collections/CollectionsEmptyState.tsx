import Link from 'next/link';
import { FolderTree, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CollectionsEmptyState() {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="py-12 text-center">
                <FolderTree className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No collections yet</h3>
                <p className="mb-4 text-gray-600">Create your first collection to organize products</p>
                <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                    <Link href="/admin/collections/new">
                        <Plus className="w-4 h-4" />
                        Add Your First Collection
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
