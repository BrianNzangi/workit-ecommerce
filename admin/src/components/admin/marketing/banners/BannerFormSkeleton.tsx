import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BannerFormSkeleton() {
    return (
        <div className="grid w-full grid-cols-1 items-start gap-6 xl:grid-cols-12">
            <div className="space-y-6 xl:col-span-8">
                <Card className="border-gray-200 shadow-xs">
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-4 w-72" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-xs">
                    <CardHeader className="space-y-3">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Skeleton className="h-44 w-full" />
                        <Skeleton className="h-44 w-full" />
                    </CardContent>
                </Card>
            </div>

            <div className="xl:col-span-4">
                <Card className="border-gray-200 shadow-xs">
                    <CardHeader className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-9 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
