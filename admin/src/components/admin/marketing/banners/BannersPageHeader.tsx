import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BannersPageHeader() {
    return (
        <div className="mb-5 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Banners</h1>

            <Button asChild size="sm" className="rounded bg-primary-900 text-white hover:bg-primary-800">
                <Link href="/admin/marketing/banners/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Banner
                </Link>
            </Button>
        </div>
    );
}
