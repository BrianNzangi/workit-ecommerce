import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

export function OrdersLoadingState() {
    return (
        <div className="rounded border border-gray-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            <th className="w-12 px-4 py-3">
                                <Checkbox disabled />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-16" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-12" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-20" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-24" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-24" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-12 ml-auto" />
                            </th>
                            <th className="w-32 px-4 py-3">
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="px-4 py-3">
                                <td className="px-4 py-3">
                                    <Checkbox disabled />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-20" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-24" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-28" />
                                        <Skeleton className="h-3 w-32" />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-5 w-16 rounded" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-5 w-16 rounded" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
