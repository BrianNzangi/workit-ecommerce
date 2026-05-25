import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export function CollectionsLoadingState() {
    return (
        <Card className="border-gray-200">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Collection</TableHead>
                            <TableHead className="w-24 text-center">Sort</TableHead>
                            <TableHead className="w-36 text-center">Most Shopped</TableHead>
                            <TableHead className="w-28 text-center">Products</TableHead>
                            <TableHead className="w-24 text-center">Status</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {i < 3 && <Skeleton className="h-5 w-5" />}
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="mx-auto h-4 w-6" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="mx-auto h-5 w-16" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="mx-auto h-5 w-8" />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Skeleton className="mx-auto h-5 w-14" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
