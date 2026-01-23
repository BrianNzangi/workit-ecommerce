'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProductService } from '@/lib/services/product.service';
import { CollectionService } from '@/lib/services/collection.service';
import { BrandService } from '@/lib/services/brand.service';

import { Package, Plus, Edit, Trash2, Upload, Download, FileDown, Search, X, Filter, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    salePrice: number | null;
    originalPrice: number | null;
    enabled: boolean;
    createdAt: string;
    stockOnHand: number;
    collections?: Array<{
        collection: {
            id: string;
            name: string;
        };
    }>;
    homepageCollections?: Array<{
        collection: {
            id: string;
            title: string;
        };
    }>;
}

export default function ProductsPage() {

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importResults, setImportResults] = useState<any>(null);

    // Delete modal states
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [selectedStockStatus, setSelectedStockStatus] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // Collections and Brands for filters
    const [collections, setCollections] = useState<Array<{ id: string; name: string }>>([]);
    const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

    const fetchProducts = async () => {
        try {
            const productService = new ProductService();
            const data = await productService.getProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const collectionService = new CollectionService();
            const data = await collectionService.getCollections();
            setCollections(data);
        } catch (error) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const brandService = new BrandService();
            const data = await brandService.getBrands();
            setBrands(data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCollections();
        fetchBrands();
    }, []);

    // Apply filters whenever filter criteria or products change
    useEffect(() => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.slug.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCollection) {
            filtered = filtered.filter(product =>
                product.collections?.some(pc => pc.collection.id === selectedCollection) || false
            );
        }

        // Brand filter
        if (selectedBrand) {
            filtered = filtered.filter(product =>
                (product as any).brandId === selectedBrand
            );
        }

        // Status filter
        if (selectedStatus) {
            filtered = filtered.filter(product =>
                selectedStatus === 'active' ? product.enabled : !product.enabled
            );
        }

        // Condition filter
        if (selectedCondition) {
            filtered = filtered.filter(product =>
                (product as any).condition === selectedCondition
            );
        }

        if (selectedStockStatus) {
            filtered = filtered.filter(product => {
                const totalStock = product.stockOnHand || 0;
                if (selectedStockStatus === 'in_stock') return totalStock > 0;
                if (selectedStockStatus === 'low_stock') return totalStock > 0 && totalStock <= 10;
                if (selectedStockStatus === 'out_of_stock') return totalStock === 0;
                return true;
            });
        }

        if (minPrice || maxPrice) {
            filtered = filtered.filter(product => {
                const productPrice = product.salePrice || 0;
                const min = minPrice ? parseFloat(minPrice) : 0;
                const max = maxPrice ? parseFloat(maxPrice) : Infinity;
                return productPrice >= min && productPrice <= max;
            });
        }

        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [products, searchTerm, selectedCollection, selectedBrand, selectedStatus, selectedCondition, selectedStockStatus, minPrice, maxPrice]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCollection('');
        setSelectedBrand('');
        setSelectedStatus('');
        setSelectedCondition('');
        setSelectedStockStatus('');
        setMinPrice('');
        setMaxPrice('');
    };

    const activeFiltersCount = [
        searchTerm,
        selectedCollection,
        selectedBrand,
        selectedStatus,
        selectedCondition,
        selectedStockStatus,
        minPrice,
        maxPrice
    ].filter(Boolean).length;

    // Pagination calculations
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Pagination helpers
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to page 1 when changing items per page
    };

    const handleDelete = (productId: string, productName: string) => {
        setProductToDelete({ id: productId, name: productName });
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok || response.status === 204) {
                toast({
                    title: 'Product deleted',
                    description: `"${productToDelete.name}" has been deleted successfully.`,
                    variant: 'success',
                });
                await fetchProducts();
                setDeleteModalOpen(false);
                setProductToDelete(null);
            } else {
                const data = await response.json().catch(() => ({ error: 'Unknown error' }));
                toast({
                    title: 'Delete failed',
                    description: data.error || data.message || 'Failed to delete product',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: 'Delete failed',
                description: 'An error occurred while deleting the product',
                variant: 'error',
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch('/api/admin/products/export');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `products-export-${Date.now()}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error exporting products:', error);
            alert('Failed to export products');
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            const response = await fetch('/api/admin/products/template');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'product-import-template.csv';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading template:', error);
            alert('Failed to download template');
        }
    };

    const handleImport = async () => {
        if (!importFile) return;

        setImporting(true);
        setImportResults(null);

        try {
            const formData = new FormData();
            formData.append('file', importFile);

            const response = await fetch('/api/admin/products/import', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const results = await response.json();
                setImportResults(results);
                await fetchProducts(); // Refresh product list
            } else {
                const error = await response.json();
                alert(`Import failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Error importing products:', error);
            alert('Failed to import products');
        } finally {
            setImporting(false);
        }
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getProductPrice = (product: Product): string => {
        if (product.salePrice) {
            return `KES ${formatPrice(product.salePrice)}`;
        }
        return 'N/A';
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                {/* Search and Filters Bar */}
                <div className="mb-6 space-y-4">
                    <div className="flex gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products by name or slug..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xs transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="px-2 py-0.5 bg-primary-800 text-white text-xs rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="bg-white border border-gray-200 rounded-xs p-4 shadow-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Collection Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Collection
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedCollection}
                                            onChange={(e) => setSelectedCollection(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="">All Collections</option>
                                            {collections.map(collection => (
                                                <option key={collection.id} value={collection.id}>
                                                    {collection.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Brand Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Brand
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedBrand}
                                            onChange={(e) => setSelectedBrand(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="">All Brands</option>
                                            {brands.map(brand => (
                                                <option key={brand.id} value={brand.id}>
                                                    {brand.name}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="">All Status</option>
                                            <option value="active">Active</option>
                                            <option value="inactive">Draft</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Condition Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Condition
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedCondition}
                                            onChange={(e) => setSelectedCondition(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="">All Conditions</option>
                                            <option value="NEW">New</option>
                                            <option value="REFURBISHED">Refurbished</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Stock Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Stock Status
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={selectedStockStatus}
                                            onChange={(e) => setSelectedStockStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent appearance-none"
                                        >
                                            <option value="">All Stock Levels</option>
                                            <option value="in_stock">In Stock</option>
                                            <option value="low_stock">Low Stock (≤10)</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Min Price Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Price (KES)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                    />
                                </div>

                                {/* Max Price Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Price (KES)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="999999"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                    />
                                </div>

                                {/* Clear Filters Button */}
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        disabled={activeFiltersCount === 0}
                                        className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            {/* Active Filters Summary */}
                            {activeFiltersCount > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{products.length}</span> products
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Products</h1>
                        <p className="text-gray-600">Manage your product catalog</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xs transition-colors"
                        >
                            <FileDown className="w-4 h-4" />
                            Download Template
                        </button>
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xs transition-colors shadow-xs"
                        >
                            <Upload className="w-4 h-4" />
                            Import Products
                        </button>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xs transition-colors shadow-xs"
                        >
                            <Download className="w-4 h-4" />
                            Export Products
                        </button>
                        <Link
                            href="/admin/products/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xs transition-colors shadow-xs"
                        >
                            <Plus className="w-4 h-4" />
                            Add Product
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 && products.length > 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products match your filters</h3>
                            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                            >
                                <X className="w-4 h-4" />
                                Clear All Filters
                            </button>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products yet</h3>
                            <p className="text-gray-600 mb-4">Get started by adding your first product</p>
                            <Link
                                href="/admin/products/new"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                            >
                                <Plus className="w-4 h-4" />
                                Add Your First Product
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Collections
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Homepage
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.slug}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {product.collections && product.collections.length > 0
                                                    ? product.collections.map((pc: any) => pc.collection.name).join(', ')
                                                    : <span className="text-gray-400">None</span>
                                                }
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {product.homepageCollections && product.homepageCollections.length > 0 ? (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    Yes
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getProductPrice(product)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {product.stockOnHand ?? 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.enabled
                                                    ? 'bg-primary-50 text-primary-700'
                                                    : 'bg-secondary-50 text-secondary-600'
                                                    }`}
                                            >
                                                {product.enabled ? 'Active' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="text-secondary-500 hover:text-primary-800 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="text-secondary-500 hover:text-primary-900 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {filteredProducts.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    {/* Items per page selector */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-700">Show:</span>
                                        <select
                                            value={itemsPerPage}
                                            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                                            className="px-3 py-1 border border-gray-300 rounded-xs text-sm focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        >
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                            <option value={150}>150</option>
                                            <option value={200}>200</option>
                                        </select>
                                        <span className="text-sm text-gray-700">
                                            products per page
                                        </span>
                                    </div>

                                    {/* Page info and navigation */}
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-700">
                                            Showing {startIndex + 1} to {Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
                                        </span>

                                        <div className="flex items-center gap-1">
                                            {/* Previous button */}
                                            <button
                                                onClick={() => goToPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border border-gray-300 rounded-xs text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Previous
                                            </button>

                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 7) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 4) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 3) {
                                                    pageNum = totalPages - 6 + i;
                                                } else {
                                                    pageNum = currentPage - 3 + i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => goToPage(pageNum)}
                                                        className={`px-3 py-1 border rounded-xs text-sm transition-colors ${currentPage === pageNum
                                                            ? 'bg-primary-800 text-white border-primary-800'
                                                            : 'border-gray-300 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}

                                            {/* Next button */}
                                            <button
                                                onClick={() => goToPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 border border-gray-300 rounded-xs text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xs shadow-xl p-6 max-w-lg w-full mx-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Import Products</h2>

                            {!importResults ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select CSV File
                                        </label>
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">
                                            Upload a CSV file with product data. Download the template for the correct format.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setShowImportModal(false);
                                                setImportFile(null);
                                            }}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleImport}
                                            disabled={!importFile || importing}
                                            className="flex-1 px-4 py-2 bg-primary-800 hover:bg-primary-900 text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                        >
                                            {importing ? 'Importing...' : 'Import'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xs">
                                        <p className="text-sm text-gray-700">
                                            <span className="font-semibold">Total:</span> {importResults.total}
                                        </p>
                                        <p className="text-sm text-green-600">
                                            <span className="font-semibold">Success:</span> {importResults.success}
                                        </p>
                                        <p className="text-sm text-red-600">
                                            <span className="font-semibold">Failed:</span> {importResults.failed}
                                        </p>
                                    </div>

                                    {importResults.errors && importResults.errors.length > 0 && (
                                        <div className="max-h-48 overflow-y-auto">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Errors:</p>
                                            {importResults.errors.map((err: any, idx: number) => (
                                                <p key={idx} className="text-xs text-red-600 mb-1">
                                                    Row {err.row}: {err.error}
                                                </p>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            setShowImportModal(false);
                                            setImportFile(null);
                                            setImportResults(null);
                                        }}
                                        className="w-full px-4 py-2 bg-[#FF5023] hover:bg-[#E04520] text-white rounded-xs transition-colors shadow-xs"
                                    >
                                        Close
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <AlertModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                    title="Delete Product"
                    description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                />

            </AdminLayout>
        </ProtectedRoute>
    );
}
