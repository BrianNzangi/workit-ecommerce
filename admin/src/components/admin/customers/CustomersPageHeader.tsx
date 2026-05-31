import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CustomersPageHeader() {
    return (
        <div className="mb-5 bg-white rounded-lg p-3 sm:p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Customers</h1>

            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded text-gray-500 hover:text-gray-900">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
                <Button asChild size="sm" className="rounded bg-primary-900 text-white hover:bg-primary-800">
                    <Link href="/admin/customers/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Link>
                </Button>
            </div>
        </div>
    );
}
