'use client';

import { useEffect, useState } from 'react';
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
    CollectionsTreeTable,
} from '@/components/admin/catalog/collections';

interface CollectionToDelete {
    id: string;
    name: string;
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<CollectionToDelete | null>(null);

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const service = new CollectionService();
            const data = await service.getCollections({ includeChildren: true });
            setCollections(data as unknown as Collection[]);
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

    const toggleExpanded = (collectionId: string) => {
        setExpandedCollections((prev) => {
            const next = new Set(prev);
            if (next.has(collectionId)) {
                next.delete(collectionId);
            } else {
                next.add(collectionId);
            }
            return next;
        });
    };

    const openDeleteDialog = (collectionId: string, collectionName: string) => {
        setCollectionToDelete({ id: collectionId, name: collectionName });
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setCollectionToDelete(null);
    };

    const confirmDelete = async () => {
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
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <CollectionsHeader />

                {loading ? (
                    <CollectionsLoadingState />
                ) : collections.length === 0 ? (
                    <CollectionsEmptyState />
                ) : (
                    <CollectionsTreeTable
                        collections={collections}
                        expandedCollections={expandedCollections}
                        onToggleExpanded={toggleExpanded}
                        onDelete={openDeleteDialog}
                    />
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
