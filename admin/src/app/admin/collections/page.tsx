'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { CollectionService } from '@/lib/services/collections/collection.service';
import {
    Collection,
    CollectionsDeleteDialog,
    CollectionsEmptyState,
    CollectionsHeader,
    CollectionsLoadingState,
    CollectionsStats,
    CollectionsToolbar,
    CollectionsTreeTable,
} from '@/components/admin/catalog/collections';

interface CollectionToDelete {
    id: string;
    name: string;
}

function getAllCollectionIds(collections: Collection[]): string[] {
    const ids: string[] = [];
    for (const collection of collections) {
        ids.push(collection.id);
        if (collection.children) {
            ids.push(...getAllCollectionIds(collection.children));
        }
    }
    return ids;
}

function countAllCollections(collections: Collection[]): number {
    let count = 0;
    for (const collection of collections) {
        count += 1;
        if (collection.children) {
            count += countAllCollections(collection.children);
        }
    }
    return count;
}

function filterCollectionsByName(
    collections: Collection[],
    searchTerm: string
): Collection[] {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return collections;

    return collections.reduce<Collection[]>((acc, collection) => {
        const nameMatches = collection.name.toLowerCase().includes(normalizedSearch);
        const slugMatches = collection.slug.toLowerCase().includes(normalizedSearch);

        const filteredChildren = collection.children
            ? filterCollectionsByName(collection.children, searchTerm)
            : [];

        if (nameMatches || slugMatches || filteredChildren.length > 0) {
            acc.push({
                ...collection,
                children: filteredChildren.length > 0 ? filteredChildren : collection.children,
            });
        }

        return acc;
    }, []);
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<CollectionToDelete | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const service = new CollectionService();
            const data = await service.getCollections({ includeChildren: true });
            const all = data as unknown as Collection[];
            const topLevel = all.filter((c) => c.parentId == null);
            setCollections(topLevel);
        } catch (error) {
            console.error('Error fetching collections:', error);
            toast({
                title: 'Error',
                description: 'Failed to load collections',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const toggleExpanded = useCallback((collectionId: string) => {
        setExpandedCollections((prev) => {
            const next = new Set(prev);
            if (next.has(collectionId)) {
                next.delete(collectionId);
            } else {
                next.add(collectionId);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        const allIds = getAllCollectionIds(collections);
        setExpandedCollections(new Set(allIds));
    }, [collections]);

    const collapseAll = useCallback(() => {
        setExpandedCollections(new Set());
    }, []);

    const openDeleteDialog = useCallback((collectionId: string, collectionName: string) => {
        setCollectionToDelete({ id: collectionId, name: collectionName });
        setDeleteDialogOpen(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setCollectionToDelete(null);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!collectionToDelete) return;

        setDeleteLoading(true);
        try {
            const service = new CollectionService();
            await service.deleteCollection(collectionToDelete.id);

            toast({
                title: 'Collection deleted',
                description: `"${collectionToDelete.name}" has been successfully deleted.`,
                variant: 'success',
            });

            await fetchCollections();
            closeDeleteDialog();
        } catch (error: any) {
            console.error('Error deleting collection:', error);
            toast({
                title: 'Delete failed',
                description: error.message || 'Failed to delete collection',
                variant: 'error',
            });
        } finally {
            setDeleteLoading(false);
        }
    }, [collectionToDelete, closeDeleteDialog]);

    const filteredCollections = useMemo(
        () => filterCollectionsByName(collections, searchTerm),
        [collections, searchTerm]
    );

    const filteredCount = useMemo(
        () => countAllCollections(filteredCollections),
        [filteredCollections]
    );

    const totalCount = useMemo(
        () => countAllCollections(collections),
        [collections]
    );

    const showStats = !loading && collections.length > 0;
    const showEmpty = !loading && collections.length === 0;
    const showNoResults = !loading && collections.length > 0 && filteredCount === 0;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <CollectionsHeader />

                {showStats && <CollectionsStats collections={collections} />}

                {loading ? (
                    <CollectionsLoadingState />
                ) : showEmpty ? (
                    <CollectionsEmptyState />
                ) : (
                    <>
                        <CollectionsToolbar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onExpandAll={expandAll}
                            onCollapseAll={collapseAll}
                            collectionCount={totalCount}
                            filteredCount={filteredCount}
                        />

                        {showNoResults ? (
                            <CollectionsEmptyState searchTerm={searchTerm} />
                        ) : (
                            <CollectionsTreeTable
                                collections={filteredCollections}
                                expandedCollections={expandedCollections}
                                onToggleExpanded={toggleExpanded}
                                onDelete={openDeleteDialog}
                                searchTerm={searchTerm}
                            />
                        )}
                    </>
                )}

                <CollectionsDeleteDialog
                    open={deleteDialogOpen}
                    loading={deleteLoading}
                    collectionName={collectionToDelete?.name}
                    onOpenChange={(open) => {
                        if (!open) closeDeleteDialog();
                    }}
                    onConfirm={confirmDelete}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
