import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BannerFormMode } from './types';

interface BannerSaveCardProps {
    mode: BannerFormMode;
    loading?: boolean;
}

export function BannerSaveCard({ mode, loading }: BannerSaveCardProps) {
    const isEdit = mode === 'edit';
    const submitLabel = loading
        ? (isEdit ? 'Saving Changes...' : 'Creating Banner...')
        : (isEdit ? 'Save Changes' : 'Create Banner');

    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle className="text-base font-black tracking-tight text-secondary-900">
                    Save
                </CardTitle>
                <CardDescription className="font-medium text-secondary-500">
                    Validate key fields and publish placement.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 rounded-xs border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary-400">
                        Checklist
                    </p>
                    <ul className="space-y-1 text-sm font-medium text-secondary-700">
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-900" />
                            Banner name
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-900" />
                            Position and sort order
                        </li>
                        <li className="flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-900" />
                            Desktop/mobile image
                        </li>
                    </ul>
                </div>

                <Separator className="bg-gray-200" />

                <div className="space-y-2">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-900 text-white hover:bg-primary-800"
                    >
                        {submitLabel}
                    </Button>
                    <Button asChild variant="outline" className="w-full border-gray-200">
                        <Link href="/admin/marketing/banners">Cancel</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
