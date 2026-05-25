import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BrandsHeader() {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Brands</h1>
                <p className="text-gray-600">Manage product brands in your catalog</p>
            </div>

            <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                <Link href="/admin/brands/new">
                    <Plus className="h-4 w-4" />
                    Add Brand
                </Link>
            </Button>
        </div>
    );
}
