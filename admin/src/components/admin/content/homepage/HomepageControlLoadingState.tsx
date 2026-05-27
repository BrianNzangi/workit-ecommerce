'use client';

import { Card } from '@/components/ui/card';

export function HomepageControlLoadingState() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-gray-200 rounded" />
            <div className="h-4 w-96 bg-gray-200 rounded" />
            <Card>
                <div className="p-4 border-b border-gray-100">
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
                <div className="divide-y divide-gray-100">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                            <div className="h-8 w-8 bg-gray-200 rounded" />
                            <div className="flex-1 space-y-1">
                                <div className="h-4 w-40 bg-gray-200 rounded" />
                                <div className="h-3 w-64 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
