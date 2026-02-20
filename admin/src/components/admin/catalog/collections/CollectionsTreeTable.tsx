import type { ReactNode } from 'react';
import Link from 'next/link';
import {
    ChevronDown,
    ChevronRight,
    Edit,
    Trash2,
    TrendingUp,
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
}

const getLevelMeta = (level: number) => {
    if (level === 0) {
        return { label: 'Category', className: 'border-primary-200 bg-primary-100 text-primary-900' };
    }
    if (level === 1) {
        return { label: 'Group', className: 'border-amber-200 bg-amber-100 text-amber-800' };
    }
    return { label: 'Sub-collection', className: 'border-blue-200 bg-blue-100 text-blue-800' };
};

const getRowTintClass = (level: number) => {
    if (level === 1) return 'bg-gray-50/50';
    if (level >= 2) return 'bg-blue-50/20';
    return '';
};

export function CollectionsTreeTable({
    collections,
    expandedCollections,
    onToggleExpanded,
    onDelete,
}: CollectionsTreeTableProps) {
    const renderRows = (collection: Collection, level = 0): ReactNode[] => {
        const hasChildren = Boolean(collection.children && collection.children.length > 0);
        const isExpanded = expandedCollections.has(collection.id);
        const levelMeta = getLevelMeta(level);
        const tintClass = getRowTintClass(level);

        const currentRow = (
            <TableRow key={collection.id} className={`${tintClass} hover:bg-white`}>
                <TableCell className="w-115">
                    <div className="flex items-start gap-2">
                        <div className="flex w-6 justify-center pt-0.5">
                            {hasChildren ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onToggleExpanded(collection.id)}
                                    className="h-5 w-5 text-gray-600 hover:text-primary-900"
                                >
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </Button>
                            ) : level > 0 ? (
                                <span className="select-none text-sm text-gray-300">└</span>
                            ) : null}
                        </div>

                        <div className="min-w-0 flex-1" style={{ paddingLeft: `${level * 24}px` }}>
                            <div className="flex flex-wrap items-center gap-2">
                                <p className={`truncate text-sm font-semibold ${level === 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {collection.name}
                                </p>
                                <Badge variant="outline" className={`rounded-xs px-2 py-0.5 text-[10px] uppercase tracking-wider ${levelMeta.className}`}>
                                    {levelMeta.label}
                                </Badge>
                                {hasChildren && (
                                    <span className="text-[10px] italic text-gray-500">
                                        ({collection.children!.length} {level === 0 ? 'groups' : 'subs'})
                                    </span>
                                )}
                            </div>
                            <p className="truncate font-mono text-[10px] text-gray-400">{collection.slug}</p>
                        </div>
                    </div>
                </TableCell>

                <TableCell className="w-24 text-center text-xs font-medium text-gray-600">
                    {collection.sortOrder}
                </TableCell>

                <TableCell className="w-36 text-center">
                    {collection.showInMostShopped ? (
                        <Badge variant="secondary" className="inline-flex items-center gap-1 rounded-xs bg-purple-100 px-2 py-1 text-[10px] font-bold uppercase text-purple-800">
                            <TrendingUp className="h-3 w-3" />
                            Featured
                        </Badge>
                    ) : (
                        <span className="text-xs text-gray-300">-</span>
                    )}
                </TableCell>

                <TableCell className="w-28 text-center">
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500">
                        {collection._count?.products || 0}
                    </span>
                </TableCell>

                <TableCell className="w-24 text-center">
                    <Badge
                        variant={collection.enabled ? 'success' : 'secondary'}
                        className={`rounded-xs px-2 py-1 text-[10px] font-bold uppercase ${collection.enabled ? '' : 'bg-gray-100 text-gray-600'}`}
                    >
                        {collection.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                </TableCell>

                <TableCell className="w-24">
                    <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-primary-900">
                            <Link href={`/admin/collections/${collection.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(collection.id, collection.name)}
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        );

        if (!hasChildren || !isExpanded) {
            return [currentRow];
        }

        return [
            currentRow,
            ...collection.children!.flatMap((child) => renderRows(child, level + 1)),
        ];
    };

    return (
        <Card className="overflow-hidden border-gray-200 shadow-xs">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="px-4 text-xs uppercase tracking-wider">Collection</TableHead>
                            <TableHead className="w-24 text-center text-xs uppercase tracking-wider">Sort</TableHead>
                            <TableHead className="w-36 text-center text-xs uppercase tracking-wider">Most Shopped</TableHead>
                            <TableHead className="w-28 text-center text-xs uppercase tracking-wider">Products</TableHead>
                            <TableHead className="w-24 text-center text-xs uppercase tracking-wider">Status</TableHead>
                            <TableHead className="w-24 text-right text-xs uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {collections
                            .filter((collection) => !collection.parentId)
                            .flatMap((collection) => renderRows(collection))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
