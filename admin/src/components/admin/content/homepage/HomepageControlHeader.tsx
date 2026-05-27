'use client';

import { LayoutDashboard } from 'lucide-react';

export function HomepageControlHeader() {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary-50">
                    <LayoutDashboard className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Homepage Control</h1>
                    <p className="text-sm text-gray-500">
                        Configure which sections appear on your storefront homepage and their display order
                    </p>
                </div>
            </div>
        </div>
    );
}
