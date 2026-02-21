'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CampaignFormMode } from './types';

interface CampaignFormHeaderProps {
    mode: CampaignFormMode;
    campaignName?: string;
}

export function CampaignFormHeader({ mode, campaignName }: CampaignFormHeaderProps) {
    const isEdit = mode === 'edit';

    return (
        <div className="mb-8">
            <Link
                href="/admin/marketing/campaigns"
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Campaigns
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
                {isEdit ? 'Edit Campaign' : 'Create Campaign'}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
                {isEdit ? `Update campaign details${campaignName ? ` for ${campaignName}` : ''}` : 'Set up a new marketing campaign'}
            </p>
        </div>
    );
}
