import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CustomersPageHeader() {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="mb-1 text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm font-medium tracking-tight text-gray-500">
                    Manage and view your store&apos;s customer base
                </p>
            </div>

            <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="border-gray-200">
                    <Link href="/admin/customers/segments">
                        <Users className="h-4 w-4" />
                        Segments
                    </Link>
                </Button>
                <Button asChild className="bg-primary-900 text-white hover:bg-primary-800">
                    <Link href="/admin/customers/new">
                        <Plus className="h-4 w-4" />
                        Add Customer
                    </Link>
                </Button>
            </div>
        </div>
    );
}
