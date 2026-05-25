import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomersLoadingState() {
    return (
        <div className="rounded bg-white">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="w-12 px-4 py-3">
                                <Checkbox disabled />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-12" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-16" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-12 ml-auto" />
                            </th>
                            <th className="px-4 py-3">
                                <Skeleton className="h-4 w-16 ml-auto" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-50">
                                <td className="px-4 py-3">
                                    <Checkbox disabled />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-24" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-8 ml-auto" />
                                </td>
                                <td className="px-4 py-3">
                                    <Skeleton className="h-4 w-16 ml-auto" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
