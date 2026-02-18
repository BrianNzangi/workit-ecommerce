'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ArrowLeft, Search, Trash2, Plus, Image as ImageIcon, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { HomepageCollectionService } from '@/lib/services';
import { getImageUrl } from '@/lib/shared/images/image-utils';

export default function EditHomepageCollectionPage() {
    const router = useRouter();
    const params = useParams();
    const collectionId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        enabled: true,
        sortOrder: 0,
    });
    const [products, setProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchCollection();
    }, [collectionId]);

    const fetchCollection = async () => {
        try {
            const service = new HomepageCollectionService();
            const data = await service.getHomepageCollection(collectionId);

            setFormData({
                title: data.title || '',
                slug: data.slug || '',
                enabled: data.enabled ?? true,
                sortOrder: data.sortOrder ?? 0,
            });
            // Extract products from the returned relation
            if (data.products) {
                setProducts(data.products.map((p: any) => p.product).filter(Boolean));
            }
        } catch (error: any) {
            console.error('Error fetching collection:', error);
            setError(error.message || 'Failed to load collection');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
        if (name === 'title') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleSearch = async () => {
        if (!productSearch.trim()) return;
        setSearching(true);
        try {
            const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(productSearch)}`);
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.products || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setSearching(false);
        }
    };

    const addProduct = (product: any) => {
        if (products.some(p => p.id === product.id)) {
            toast({
                title: 'Product already added',
                description: 'This product is already in the collection.',
                variant: 'error'
            });
            return;
        }
        setProducts([...products, product]);
        setSearchResults([]);
        setProductSearch('');
    };

    const removeProduct = (productId: string) => {
        setProducts(products.filter(p => p.id !== productId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const service = new HomepageCollectionService();
            await service.updateHomepageCollection(collectionId, {
                ...formData,
                sortOrder: parseInt((formData.sortOrder ?? 0).toString()),
                productIds: products.map(p => p.id)
            });

            toast({
                title: 'Collection updated',
                description: 'Homepage collection has been updated successfully.',
                variant: 'success',
            });
            router.push('/admin/homepage-collections');
        } catch (error: any) {
            console.error('Error updating collection:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update homepage collection',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading collection...</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Link
                                href="/admin/homepage-collections"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Collections
                            </Link>
                        </div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <Link
                        href="/admin/homepage-collections"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Homepage Collections
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Homepage Collection</h1>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        placeholder="e.g., Featured Products"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                        URL Slug *
                                    </label>
                                    <input
                                        type="text"
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        placeholder="featured-products"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Auto-generated from title</p>
                                </div>

                                <div>
                                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        id="sortOrder"
                                        name="sortOrder"
                                        value={formData.sortOrder}
                                        onChange={handleChange}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                                </div>

                                <div>
                                    <label htmlFor="enabled" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="enabled"
                                        name="enabled"
                                        value={String(formData.enabled ?? true)}
                                        onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.value === 'true' }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating...' : 'Update Collection'}
                                </button>
                                <Link
                                    href="/admin/homepage-collections"
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs transition-colors"
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </form>

                    <div className="flex-1 max-w-2xl space-y-6">
                        {/* Product Management Section */}
                        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Products</h2>

                            {/* Search Box */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                        placeholder="Search for products to add..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    />
                                    {productSearch && (
                                        <button
                                            onClick={() => { setProductSearch(''); setSearchResults([]); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                        >
                                            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-xs shadow-lg max-h-64 overflow-y-auto">
                                        {searchResults.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 cursor-pointer"
                                                onClick={() => addProduct(product)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {product.assets?.[0]?.asset?.source ? (
                                                        <img
                                                            src={getImageUrl(product.assets[0].asset.source)}
                                                            alt=""
                                                            className="w-10 h-10 object-cover rounded-[2px]"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-[2px]">
                                                            <ImageIcon className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                        <p className="text-xs text-gray-500">SKU: {product.sku || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <button className="p-1 hover:bg-green-50 text-green-600 rounded">
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searching && (
                                    <div className="mt-2 text-center py-2">
                                        <p className="text-sm text-gray-500 animate-pulse">Searching...</p>
                                    </div>
                                )}
                            </div>

                            {/* Current Products List */}
                            <div className="space-y-3">
                                {products.length === 0 ? (
                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xs">
                                        <p className="text-gray-500 text-sm">No products in this collection</p>
                                        <p className="text-xs text-gray-400 mt-1">Search and add products to showcase them.</p>
                                    </div>
                                ) : (
                                    products.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between p-3 border border-gray-100 rounded-xs bg-gray-50/50 hover:border-gray-200 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-300 w-4">{index + 1}</span>
                                                {product.assets?.[0]?.asset?.source ? (
                                                    <img
                                                        src={getImageUrl(product.assets[0].asset.source)}
                                                        alt=""
                                                        className="w-10 h-10 object-cover rounded-[2px] border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-[2px]">
                                                        <ImageIcon className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                                    <p className="text-xs text-gray-500">KES {parseFloat(product.salePrice).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeProduct(product.id)}
                                                className="p-2 hover:bg-red-50 text-red-500 rounded-xs transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
