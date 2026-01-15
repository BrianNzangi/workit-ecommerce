'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Package, Plus, Edit, Trash2, FolderTree, ChevronDown, ChevronRight, TrendingUp } from 'lucide-react';

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

    const fetchCollections = async () => {
        try {
            const response = await fetch('/api/admin/collections?includeChildren=true');
            if (response.ok) {
                const data = await response.json();
                setCollections(data);
            }
        } catch (error) {
            console.error('Error fetching collections:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const handleDelete = async (collectionId: string, collectionName: string) => {
        if (!confirm(`Are you sure you want to delete "${collectionName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/collections/${collectionId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchCollections();
            } else {
                const data = await response.json();
                alert(`Failed to delete collection: ${data.error}`);
            }
        } catch (error) {
            console.error('Error deleting collection:', error);
            alert('Failed to delete collection');
        }
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
                                <span className="text-xs text-gray-500 flex-shrink-0">
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
            </AdminLayout>
        </ProtectedRoute>
    );
}
