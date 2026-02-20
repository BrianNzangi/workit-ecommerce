import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CollectionsHeader() {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Collections</h1>
                <p className="text-gray-600">Organize products into collections</p>
            </div>

            <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                <Link href="/admin/collections/new">
                    <Plus className="w-4 h-4" />
                    Add Collection
                </Link>
            </Button>
        </div>
    );
}
