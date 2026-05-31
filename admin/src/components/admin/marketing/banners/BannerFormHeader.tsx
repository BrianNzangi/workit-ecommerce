import { Image as ImageIcon } from 'lucide-react';
import { BannerFormMode } from './types';

interface BannerFormHeaderProps {
    mode: BannerFormMode;
}

export function BannerFormHeader({ mode }: BannerFormHeaderProps) {
    const isEdit = mode === 'edit';

    return (
        <div className="mb-6 bg-white rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xs bg-primary-50 text-primary-900">
                    <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-secondary-900">
                        {isEdit ? 'Edit Banner' : 'Create Banner'}
                    </h1>
                </div>
            </div>
        </div>
    );
}
