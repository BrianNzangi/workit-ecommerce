import { useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import {
    ChevronDown,
    ChevronRight,
    Edit,
    Menu,
    Trash2,
    TrendingUp,
    FolderTree,
} from 'lucide-react';
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
import { Collection } from './types';

interface CollectionsTreeTableProps {
    collections: Collection[];
    expandedCollections: Set<string>;
    onToggleExpanded: (collectionId: string) => void;
    onDelete: (collectionId: string, collectionName: string) => void;
    searchTerm?: string;
}

const getLevelMeta = (level: number) => {
    if (level === 0) {
        return { label: 'Category', variant: 'primary' as const };
    }
    if (level === 1) {
        return { label: 'Group', variant: 'warning' as const };
    }
    return { label: 'Sub', variant: 'info' as const };
};

function flattenCollections(
    collections: Collection[],
    expandedCollections: Set<string>,
    level = 0,
    searchTerm = ''
): { collection: Collection; level: number; matchesSearch: boolean }[] {
    const result: { collection: Collection; level: number; matchesSearch: boolean }[] = [];

    for (const collection of collections) {
        const nameMatches = collection.name.toLowerCase().includes(searchTerm.toLowerCase());
        const slugMatches = collection.slug.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = !searchTerm || nameMatches || slugMatches;

        const hasChildren = Boolean(collection.children && collection.children.length > 0);
        const isExpanded = expandedCollections.has(collection.id);

        result.push({ collection, level, matchesSearch });

        if (hasChildren && isExpanded) {
            const childResults = flattenCollections(
                collection.children!,
                expandedCollections,
                level + 1,
                searchTerm
            );

            const hasMatchingDescendant = childResults.some((c) => c.matchesSearch);

            if (!searchTerm || matchesSearch || hasMatchingDescendant) {
                result.push(...childResults);
            }
        }
    }

    return result;
}

export function CollectionsTreeTable({
    collections,
    expandedCollections,
    onToggleExpanded,
    onDelete,
    searchTerm = '',
}: CollectionsTreeTableProps) {
    const flatRows = useMemo(
        () => flattenCollections(collections, expandedCollections, 0, searchTerm),
        [collections, expandedCollections, searchTerm]
    );

    const visibleRows = useMemo(() => {
        if (!searchTerm) return flatRows;

        const result: typeof flatRows = [];
        for (let i = 0; i < flatRows.length; i++) {
            const row = flatRows[i];
            if (row.matchesSearch) {
                result.push(row);
            }
        }
        return result;
    }, [flatRows, searchTerm]);

    return (
        <Card className="border-gray-200">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="px-4">Collection</TableHead>
                            <TableHead className="w-20 text-center">Sort</TableHead>
                            <TableHead className="w-32 text-center">Most Shopped</TableHead>
                            <TableHead className="w-28 text-center">Menu Header</TableHead>
                            <TableHead className="w-24 text-center">Products</TableHead>
                            <TableHead className="w-24 text-center">Status</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <FolderTree className="h-8 w-8 text-gray-300" />
                                        <p className="text-sm text-gray-500">
                                            {searchTerm
                                                ? 'No collections match your search'
                                                : 'No collections found'}
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibleRows.map(({ collection, level }) => {
                                const hasChildren = Boolean(
                                    collection.children && collection.children.length > 0
                                );
                                const isExpanded = expandedCollections.has(collection.id);
                                const levelMeta = getLevelMeta(level);
                                const indentPx = level * 20;

                                return (
                                    <TableRow
                                        key={collection.id}
                                        className={`group transition-colors ${
                                            level > 0 ? 'bg-gray-50/40' : ''
                                        } hover:bg-gray-50`}
                                    >
                                        <TableCell className="px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex w-5 shrink-0 justify-center">
                                                    {hasChildren ? (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                onToggleExpanded(collection.id)
                                                            }
                                                            className="h-5 w-5 text-gray-400 hover:text-gray-700"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-3.5 w-3.5" />
                                                            ) : (
                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                            )}
                                                        </Button>
                                                    ) : level > 0 ? (
                                                        <div className="h-3.5 w-px bg-gray-200" />
                                                    ) : null}
                                                </div>

                                                <div
                                                    className="min-w-0"
                                                    style={{ paddingLeft: `${indentPx}px` }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`truncate text-sm font-medium ${
                                                                level === 0
                                                                    ? 'text-gray-900'
                                                                    : 'text-gray-700'
                                                            }`}
                                                        >
                                                            {collection.name}
                                                        </span>
                                                        <Badge
                                                            variant="outline"
                                                            className={`shrink-0 rounded-xs px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wider ${
                                                                levelMeta.variant === 'primary'
                                                                    ? 'border-primary-200 bg-primary-50 text-primary-700'
                                                                    : levelMeta.variant === 'warning'
                                                                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                                      : 'border-blue-200 bg-blue-50 text-blue-700'
                                                            }`}
                                                        >
                                                            {levelMeta.label}
                                                        </Badge>
                                                    </div>
                                                    <p className="truncate font-mono text-[10px] text-gray-400">
                                                        {collection.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center text-sm text-gray-600">
                                            {collection.sortOrder}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {collection.showInMostShopped ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="inline-flex items-center gap-1 rounded-xs bg-purple-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-purple-700"
                                                >
                                                    <TrendingUp className="h-3 w-3" />
                                                    Featured
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-gray-300">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {collection.showInMenuHeader ? (
                                                <Badge
                                                    variant="outline"
                                                    className="inline-flex items-center gap-1 rounded-xs border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-700"
                                                >
                                                    <Menu className="h-3 w-3" />
                                                    Shown
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-gray-300">-</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                {collection._count?.products || 0}
                                            </span>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge
                                                variant={
                                                    collection.enabled ? 'success' : 'secondary'
                                                }
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
                                                        href={`/admin/collections/${collection.id}/edit`}
                                                    >
                                                        <Edit className="h-3.5 w-3.5" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        onDelete(collection.id, collection.name)
                                                    }
                                                    className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
