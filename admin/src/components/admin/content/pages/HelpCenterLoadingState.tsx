import { Skeleton } from '@/components/ui/skeleton';

export function HelpCenterLoadingState() {
    return (
        <div className="space-y-5">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <Skeleton className="h-9 w-28" />
            </div>

            {/* Filters skeleton */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-9 w-64" />
                    <div className="flex gap-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className="h-7 w-20 rounded-full" />
                        ))}
                    </div>
                </div>
            </div>

            {/* List skeleton */}
            <div className="rounded-xl bg-white shadow-sm">
                <div className="px-5 py-3">
                    <div className="flex gap-6">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                </div>
                <div className="divide-y divide-gray-50">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-6 px-5 py-4">
                            <Skeleton className="h-9 w-9 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-64" />
                            </div>
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-8 w-16" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
