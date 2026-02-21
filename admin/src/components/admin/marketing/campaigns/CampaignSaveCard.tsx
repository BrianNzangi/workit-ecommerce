'use client';

import Link from 'next/link';
import { Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CampaignFormMode } from './types';

interface CampaignSaveCardProps {
    mode: CampaignFormMode;
    loading: boolean;
}

export function CampaignSaveCard({ mode, loading }: CampaignSaveCardProps) {
    const isEdit = mode === 'edit';

    return (
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            {isEdit ? 'Save Changes' : 'Create Campaign'}
                        </>
                    )}
                </Button>

                <Button type="button" variant="outline" className="w-full" asChild>
                    <Link href="/admin/marketing/campaigns">
                        <X className="h-4 w-4" />
                        Cancel
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
