'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ArrowLeft, Save, Trash2, Plus, Search, GripVertical } from 'lucide-react';

interface HomepageCollection {
    id: string;
    title: string;
    slug: string;
    enabled: boolean;
    sortOrder: number;
    products: {
        product: {
            id: string;
            name: string;
            sku: string;
            assets: {
                asset: {
                    preview: string;
                }
            }[];
        };
        sortOrder: number;
    }[];
}

interface Product {
    id: string;
    name: string;
    sku: string;
    assets: {
        asset: {
            preview: string;
        }
    }[];
}

export default function EditHomepageCollectionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [collection, setCollection] = useState<HomepageCollection | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'products'>('details');

    // Product Picker State
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [searching, setSearching] = useState(false);

    const fetchCollection = async () => {
        try {
            const response = await fetch(`/api/admin/marketing/homepage-collections/${id}`);
            if (response.ok) {
                const data = await response.json();
                setCollection(data);
            } else {
                alert('Failed to load collection');
                router.push('/admin/marketing/homepage-collections');
            }
        } catch (error) {
            console.error('Error loading collection:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollection();
    }, [id]);

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!collection) return;
        setSaving(true);

        try {
            const response = await fetch(`/api/admin/marketing/homepage-collections/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: collection.title,
                    slug: collection.slug,
                    enabled: collection.enabled,
                    sortOrder: collection.sortOrder,
                }),
            });

            if (response.ok) {
                alert('Collection updated successfully');
            } else {
                alert('Failed to update collection');
            }
        } catch (error) {
            console.error('Error updating collection:', error);
            alert('Error updating collection');
        } finally {
            setSaving(false);
        }
    };

    const searchProducts = async () => {
        if (!searchTerm) return;
        setSearching(true);
        try {
            // Using the public search endpoint we enabled earlier
            const response = await fetch('/api/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: `
                        query SearchProducts($term: String!) {
                            searchProducts(searchTerm: $term) {
                                id
                                name
                                sku
                                assets {
                                    asset {
                                        preview
                                    }
                                }
                            }
                        }
                    `,
                    variables: { term: searchTerm }
                })
            });
            const result = await response.json();
            if (result.data?.searchProducts) {
                setSearchResults(result.data.searchProducts);
            }
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setSearching(false);
        }
    };

    const addProduct = async (productId: string) => {
        try {
            const response = await fetch(`/api/admin/marketing/homepage-collections/${id}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    sortOrder: (collection?.products?.length || 0) + 1
                }),
            });

            if (response.ok) {
                fetchCollection(); // Reload to see new product
                setShowProductPicker(false);
                setSearchTerm('');
                setSearchResults([]);
            } else {
                alert('Failed to add product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const removeProduct = async (productId: string) => {
        if (!confirm('Remove this product?')) return;
        try {
            const response = await fetch(`/api/admin/marketing/homepage-collections/${id}/products?productId=${productId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchCollection();
            } else {
                alert('Failed to remove product');
            }
        } catch (error) {
            console.error('Error removing product:', error);
        }
    };

    if (loading || !collection) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="p-8 text-center">Loading...</div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <Link
                        href="/admin/marketing/homepage-collections"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Collections
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Collection: {collection.title}</h1>
                </div>

                <div className="flex space-x-4 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`pb-2 px-1 ${activeTab === 'details' ? 'border-b-2 border-[#FF5023] text-[#FF5023]' : 'text-gray-500'}`}
                    >
                        Details
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`pb-2 px-1 ${activeTab === 'products' ? 'border-b-2 border-[#FF5023] text-[#FF5023]' : 'text-gray-500'}`}
                    >
                        Products ({collection.products?.length || 0})
                    </button>
                </div>

                {activeTab === 'details' ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200">
                        <form onSubmit={handleUpdateDetails} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={collection.title}
                                        onChange={(e) => setCollection({ ...collection, title: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-[#FF5023] focus:border-[#FF5023]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    <input
                                        type="text"
                                        value={collection.slug}
                                        onChange={(e) => setCollection({ ...collection, slug: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-[#FF5023] focus:border-[#FF5023]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                    <input
                                        type="number"
                                        value={collection.sortOrder}
                                        onChange={(e) => setCollection({ ...collection, sortOrder: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-[#FF5023] focus:border-[#FF5023]"
                                    />
                                </div>
                                <div className="flex items-center space-x-3 pt-8">
                                    <input
                                        type="checkbox"
                                        id="enabled"
                                        checked={collection.enabled}
                                        onChange={(e) => setCollection({ ...collection, enabled: e.target.checked })}
                                        className="h-4 w-4 text-[#FF5023] focus:ring-[#FF5023] border-gray-300 rounded"
                                    />
                                    <label htmlFor="enabled" className="text-sm font-medium text-gray-700">Enable this collection</label>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                                >
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={() => setShowProductPicker(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        </div>

                        {collection.products && collection.products.length > 0 ? (
                            <div className="space-y-2">
                                {collection.products.map((item) => (
                                    <div key={item.product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xs bg-gray-50">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-200 rounded-xs overflow-hidden flex-shrink-0">
                                                {item.product.assets?.[0]?.asset?.preview ? (
                                                    <img src={item.product.assets[0].asset.preview} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-sm text-gray-900">{item.product.name}</h4>
                                                <p className="text-xs text-gray-500">{item.product.sku}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-500">Order: {item.sortOrder}</span>
                                            <button
                                                onClick={() => removeProduct(item.product.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">No products in this collection yet.</div>
                        )}
                    </div>
                )}

                {/* Product Picker Modal */}
                {showProductPicker && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-lg font-bold">Add Product</h3>
                                <button onClick={() => setShowProductPicker(false)} className="text-gray-400 hover:text-gray-600">×</button>
                            </div>
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-xs"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                                    />
                                    <button
                                        onClick={searchProducts}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xs text-gray-700"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {searching ? (
                                    <div className="text-center py-8 text-gray-500">Searching...</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {searchResults.map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xs hover:bg-gray-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-xs overflow-hidden flex-shrink-0">
                                                        {product.assets?.[0]?.asset?.preview && (
                                                            <img src={product.assets[0].asset.preview} alt="" className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm text-gray-900">{product.name}</h4>
                                                        <p className="text-xs text-gray-500">{product.sku}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => addProduct(product.id)}
                                                    className="text-[#FF5023] hover:text-[#E04520] text-sm font-medium"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Type a search term and press Enter
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
