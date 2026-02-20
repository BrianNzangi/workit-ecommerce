import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BannerFormMode } from './types';

interface BannerFormHeaderProps {
    mode: BannerFormMode;
}

export function BannerFormHeader({ mode }: BannerFormHeaderProps) {
    const isEdit = mode === 'edit';

    return (
        <div className="mb-6 space-y-4">
            <Button asChild variant="ghost" className="-ml-2 w-fit text-secondary-600 hover:text-secondary-900">
                <Link href="/admin/marketing/banners">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Banners
                </Link>
            </Button>

            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs bg-primary-50 text-primary-900">
                    <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-secondary-900">
                        {isEdit ? 'Edit Banner' : 'Create Banner'}
                    </h1>
                    <p className="mt-1 text-sm font-medium text-secondary-500">
                        {isEdit
                            ? 'Update banner content, media, and display placement.'
                            : 'Create a new storefront banner with image and placement settings.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
