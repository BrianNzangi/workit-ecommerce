import { useMemo } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { HomepageCollection } from './types';

interface HomepageCollectionsTableProps {
    collections: HomepageCollection[];
    searchTerm?: string;
    onDelete: (id: string, title: string) => void;
}

export function HomepageCollectionsTable({
    collections,
    searchTerm = '',
    onDelete,
}: HomepageCollectionsTableProps) {
    const filteredCollections = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return collections;

        return collections.filter(
            (collection) =>
                collection.title.toLowerCase().includes(normalizedSearch) ||
                collection.slug.toLowerCase().includes(normalizedSearch)
        );
    }, [collections, searchTerm]);

    if (filteredCollections.length === 0) {
        return (
            <Card className="border-gray-200">
                <CardContent className="py-12 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">
                        {searchTerm ? 'No collections match your search' : 'No collections found'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-200">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-40">Slug</TableHead>
                            <TableHead className="w-24 text-center">Products</TableHead>
                            <TableHead className="w-20 text-center">Sort</TableHead>
                            <TableHead className="w-24 text-center">Status</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCollections.map((collection) => (
                            <TableRow key={collection.id} className="group">
                                <TableCell>
                                    <p className="text-sm font-medium text-gray-900">
                                        {collection.title}
                                    </p>
                                </TableCell>

                                <TableCell>
                                    <span className="font-mono text-xs text-gray-500">
                                        {collection.slug}
                                    </span>
                                </TableCell>

                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                        {collection.products?.length || 0}
                                    </span>
                                </TableCell>

                                <TableCell className="text-center text-sm text-gray-600">
                                    {collection.sortOrder}
                                </TableCell>

                                <TableCell className="text-center">
                                    <Badge
                                        variant={collection.enabled ? 'success' : 'secondary'}
                                        className={`rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                            !collection.enabled
                                                ? 'bg-gray-100 text-gray-500'
                                                : ''
                                        }`}
                                    >
                                        {collection.enabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-primary-900 hover:bg-primary-50"
                                        >
                                            <Link
                                                href={`/admin/homepage-collections/${collection.id}/edit`}
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                onDelete(collection.id, collection.title)
                                            }
                                            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
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
