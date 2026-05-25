'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { HomepageCollectionService } from '@/lib/services';
import {
    HomepageCollection,
    HomepageCollectionsHeader,
    HomepageCollectionsStats,
    HomepageCollectionsToolbar,
    HomepageCollectionsLoadingState,
    HomepageCollectionsEmptyState,
    HomepageCollectionsDeleteDialog,
    HomepageCollectionsTable,
} from '@/components/admin/catalog/homepage-collections';

interface CollectionToDelete {
    id: string;
    title: string;
}

export default function HomepageCollectionsPage() {
    const [collections, setCollections] = useState<HomepageCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<CollectionToDelete | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCollections = useCallback(async () => {
        try {
            setLoading(true);
            const service = new HomepageCollectionService();
            const data = await service.getHomepageCollections();
            setCollections(data as unknown as HomepageCollection[]);
        } catch (error) {
            console.error('Error fetching homepage collections:', error);
            toast({
                title: 'Error',
                description: 'Failed to load homepage collections',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCollections();
    }, [fetchCollections]);

    const openDeleteDialog = useCallback((id: string, title: string) => {
        setCollectionToDelete({ id, title });
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
            const service = new HomepageCollectionService();
            await service.deleteHomepageCollection(collectionToDelete.id);

            toast({
                title: 'Collection deleted',
                description: `"${collectionToDelete.title}" has been successfully deleted.`,
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
    }, [collectionToDelete, fetchCollections, closeDeleteDialog]);

    const filteredCollections = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return collections;

        return collections.filter(
            (collection) =>
                collection.title.toLowerCase().includes(normalizedSearch) ||
                collection.slug.toLowerCase().includes(normalizedSearch)
        );
    }, [collections, searchTerm]);

    const showStats = !loading && collections.length > 0;
    const showEmpty = !loading && collections.length === 0;
    const showNoResults = !loading && collections.length > 0 && filteredCollections.length === 0;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <HomepageCollectionsHeader />

                {showStats && <HomepageCollectionsStats collections={collections} />}

                {loading ? (
                    <HomepageCollectionsLoadingState />
                ) : showEmpty ? (
                    <HomepageCollectionsEmptyState />
                ) : (
                    <>
                        <HomepageCollectionsToolbar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            totalCount={collections.length}
                            filteredCount={filteredCollections.length}
                        />

                        {showNoResults ? (
                            <HomepageCollectionsEmptyState searchTerm={searchTerm} />
                        ) : (
                            <HomepageCollectionsTable
                                collections={filteredCollections}
                                searchTerm={searchTerm}
                                onDelete={openDeleteDialog}
                            />
                        )}
                    </>
                )}

                <HomepageCollectionsDeleteDialog
                    open={deleteDialogOpen}
                    loading={deleteLoading}
                    collectionTitle={collectionToDelete?.title}
                    onOpenChange={(open) => {
                        if (!open) closeDeleteDialog();
                    }}
                    onConfirm={confirmDelete}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
