'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Package, Plus, Edit, Trash2, FolderTree, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';
import { CollectionService } from '@/lib/services/collections/collection.service';

interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parentId: string | null;
    enabled: boolean;
    showInMostShopped: boolean;
    sortOrder: number;
    createdAt: string;
    children?: Collection[];
    _count?: {
        products: number;
    };
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());

    // Alert Modal State
    const [open, setOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [collectionToDelete, setCollectionToDelete] = useState<{ id: string; name: string } | null>(null);

    const fetchCollections = async () => {
        try {
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

    const onDelete = async (collectionId: string, collectionName: string) => {
        setCollectionToDelete({ id: collectionId, name: collectionName });
        setOpen(true);
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
            setOpen(false);
            setCollectionToDelete(null);
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

    const handleDelete = (collectionId: string, collectionName: string) => {
        onDelete(collectionId, collectionName);
    };

    const toggleExpanded = (collectionId: string) => {
        setExpandedCollections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(collectionId)) {
                newSet.delete(collectionId);
            } else {
                newSet.add(collectionId);
            }
            return newSet;
        });
    };

    const renderCollection = (collection: Collection, level = 0) => {
        const hasChildren = collection.children && collection.children.length > 0;
        const isExpanded = expandedCollections.has(collection.id);

        return (
            <div key={collection.id}>
                <div
                    className={`flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 ${level > 0 ? 'ml-8 bg-gray-50/50' : ''
                        }`}
                >
                    {/* Expand/Collapse Button */}
                    <div className="w-6 flex items-center justify-center">
                        {level === 0 && hasChildren ? (
                            <button
                                onClick={() => toggleExpanded(collection.id)}
                                className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                            </button>
                        ) : level > 0 ? (
                            <div className="text-gray-400 text-sm">└</div>
                        ) : null}
                    </div>

                    {/* Collection Name & Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{collection.name}</h3>
                            {level === 0 && hasChildren && (
                                <span className="text-xs text-gray-500 shrink-0">
                                    ({collection.children!.length} subcollection{collection.children!.length !== 1 ? 's' : ''})
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{collection.slug}</p>
                    </div>

                    {/* Sort Order Column */}
                    <div className="w-20 text-center">
                        <span className="text-sm text-gray-700">{collection.sortOrder}</span>
                    </div>

                    {/* Most Shopped Column */}
                    <div className="w-32 flex items-center justify-center">
                        {collection.showInMostShopped ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-xs bg-purple-100 text-purple-800">
                                <TrendingUp className="w-3 h-3" />
                                Featured
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">-</span>
                        )}
                    </div>

                    {/* Products Count */}
                    <div className="w-24 text-center">
                        {collection._count && (
                            <span className="text-xs text-gray-500">
                                {collection._count.products} product{collection._count.products !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="w-24 flex justify-center">
                        <span
                            className={`px-2 py-1 text-xs font-semibold rounded-xs ${collection.enabled
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {collection.enabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link
                            href={`/admin/collections/${collection.id}/edit`}
                            className="text-gray-600 hover:text-[#FF5023] transition-colors"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(collection.id, collection.name)}
                            className="text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Children (Subcollections) */}
                {hasChildren && isExpanded && (
                    <div>
                        {collection.children!.map((child) => renderCollection(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Collections</h1>
                        <p className="text-gray-600">Organize products into collections</p>
                    </div>
                    <Link
                        href="/admin/collections/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        Add Collection
                    </Link>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading collections...</p>
                    </div>
                ) : collections.length === 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No collections yet</h3>
                            <p className="text-gray-600 mb-4">Create your first collection to organize products</p>
                            <Link
                                href="/admin/collections/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Collection
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 overflow-hidden">
                        {/* Table Header */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">
                            <div className="w-6"></div>
                            <div className="flex-1">Collection</div>
                            <div className="w-20 text-center">Sort Order</div>
                            <div className="w-32 text-center">Most Shopped</div>
                            <div className="w-24 text-center">Products</div>
                            <div className="w-24 text-center">Status</div>
                            <div className="w-20 text-center">Actions</div>
                        </div>

                        {/* Collections List */}
                        <div className="divide-y divide-gray-200">
                            {collections
                                .filter((c) => !c.parentId) // Only show Level 1 collections
                                .map((collection) => renderCollection(collection))}
                        </div>
                    </div>
                )}

                <AlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                    title="Delete collection"
                    description={`Are you sure you want to delete "${collectionToDelete?.name}"? This action cannot be undone.`}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
