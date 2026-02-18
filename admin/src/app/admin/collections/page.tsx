'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
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

        // Level-specific styling and labeling
        const isCategory = level === 0;
        const isGroup = level === 1;
        const isSubCollection = level === 2;

        const indentClass = isCategory ? '' : isGroup ? 'ml-8 bg-gray-50/50' : 'ml-16 bg-blue-50/20';

        const getLevelBadge = () => {
            if (isCategory) return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs bg-primary-100 text-primary-900 border border-primary-200">Category</span>;
            if (isGroup) return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs bg-amber-100 text-amber-800 border border-amber-200">Group</span>;
            return <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs bg-blue-100 text-blue-800 border border-blue-200">Sub-collection</span>;
        };

        return (
            <div key={collection.id}>
                <div
                    className={`flex items-center gap-4 p-4 border-b border-gray-200 hover:bg-white transition-colors ${indentClass}`}
                >
                    {/* Expand/Collapse Button */}
                    <div className="w-6 flex items-center justify-center">
                        {hasChildren ? (
                            <button
                                onClick={() => toggleExpanded(collection.id)}
                                className="text-gray-600 hover:text-primary-900 transition-colors"
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                ) : (
                                    <ChevronRight className="w-5 h-5" />
                                )}
                            </button>
                        ) : level > 0 ? (
                            <div className="text-gray-300 text-sm ml-1 select-none">└</div>
                        ) : null}
                    </div>

                    {/* Collection Name & Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold truncate ${isCategory ? 'text-gray-900' : 'text-gray-700'}`}>
                                {collection.name}
                            </h3>
                            {getLevelBadge()}
                            {hasChildren && (
                                <span className="text-[10px] text-gray-500 font-medium shrink-0 italic">
                                    ({collection.children!.length} {isCategory ? 'groups' : 'subs'})
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] font-mono text-gray-400 truncate">{collection.slug}</p>
                    </div>

                    {/* Sort Order Column */}
                    <div className="w-20 text-center">
                        <span className="text-xs font-medium text-gray-600">Ord: {collection.sortOrder}</span>
                    </div>

                    {/* Most Shopped Column */}
                    <div className="w-32 flex items-center justify-center">
                        {collection.showInMostShopped ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-xs bg-purple-100 text-purple-800">
                                <TrendingUp className="w-3 h-3" />
                                Featured
                            </span>
                        ) : (
                            <span className="text-xs text-gray-300">-</span>
                        )}
                    </div>

                    {/* Products Count */}
                    <div className="w-24 text-center">
                        {collection._count && (
                            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {collection._count.products} Product{collection._count.products !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="w-24 flex justify-center">
                        <span
                            className={`px-2 py-1 text-[10px] font-bold uppercase rounded-xs ${collection.enabled
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                }`}
                        >
                            {collection.enabled ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <Link
                            href={`/admin/collections/${collection.id}/edit`}
                            className="p-1.5 text-gray-400 hover:text-primary-900 hover:bg-primary-50 rounded-xs transition-all"
                        >
                            <Edit className="w-4 h-4" />
                        </Link>
                        <button
                            onClick={() => handleDelete(collection.id, collection.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xs transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Children (Subcollections / L2 / L3) */}
                {hasChildren && isExpanded && (
                    <div className="border-l-2 border-primary-50">
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
