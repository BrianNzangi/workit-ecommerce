import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BannersPageHeader() {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="mb-1 text-2xl font-black tracking-tight text-secondary-900">Banners</h1>
                <p className="text-sm font-medium text-secondary-500">
                    Manage promotional banners across storefront placements.
                </p>
            </div>

            <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                <Link href="/admin/marketing/banners/new">
                    <Plus className="h-4 w-4" />
                    Create Banner
                </Link>
            </Button>
        </div>
    );
}
