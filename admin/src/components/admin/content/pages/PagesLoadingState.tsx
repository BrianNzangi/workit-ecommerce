import { Skeleton } from '@/components/ui/skeleton';

export function PagesLoadingState() {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-20" />
                ))}
            </div>

            <div className="space-y-4">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-60" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-7 w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
