import Link from 'next/link';
import { ArrowLeft, UserRoundPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomerFormMode } from './types';

interface CustomerFormHeaderProps {
    mode: CustomerFormMode;
}

export function CustomerFormHeader({ mode }: CustomerFormHeaderProps) {
    const isEdit = mode === 'edit';

    return (
        <div className="mb-6 space-y-4">
            <Button asChild variant="ghost" className="-ml-2 w-fit text-secondary-600 hover:text-secondary-900">
                <Link href="/admin/customers">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Customers
                </Link>
            </Button>

            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs bg-primary-50 text-primary-900">
                    <UserRoundPlus className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-secondary-900">
                        {isEdit ? 'Edit Customer' : 'Create Customer'}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-secondary-500">
                        {isEdit
                            ? 'Update customer profile details and keep records accurate.'
                            : 'Add a new customer account with contact and login details.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
