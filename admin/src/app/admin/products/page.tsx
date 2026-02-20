'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ProductService, CollectionService, BrandService } from '@/lib/services';
import { getImageUrl } from '@/lib/shared/images/image-utils';

import { Package, Plus, Upload, Download, FileDown, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Modular Components
import { ProductTable } from '@/components/admin/catalog/products/ProductTable';
import { ProductFilters } from '@/components/admin/catalog/products/ProductFilters';
import { ProductPagination } from '@/components/admin/catalog/products/ProductPagination';
import { ImportProductsModal } from '@/components/admin/catalog/products/ImportProductsModal';

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
    assets?: Array<{
        asset: {
            source: string;
        };
    }>;
}

interface CollectionNode {
    id: string;
    name: string;
    parentId?: string | null;
    children?: CollectionNode[];
}

interface CollectionFilterOption {
    id: string;
    name: string;
    level: number;
}

function buildCollectionFilterOptions(input: CollectionNode[]): CollectionFilterOption[] {
    if (!Array.isArray(input) || input.length === 0) return [];

    const nodeMap = new Map<string, CollectionNode>();
    const childMap = new Map<string, Set<string>>();

    const ensureNode = (node: CollectionNode) => {
        if (!nodeMap.has(node.id)) {
            nodeMap.set(node.id, {
                id: node.id,
                name: node.name,
                parentId: node.parentId ?? null,
                children: [],
            });
        } else {
            const current = nodeMap.get(node.id)!;
            current.name = node.name || current.name;
            if (node.parentId !== undefined) {
                current.parentId = node.parentId;
            }
        }
    };

    const walk = (node: CollectionNode) => {
        ensureNode(node);
        const children = Array.isArray(node.children) ? node.children : [];
        for (const child of children) {
            ensureNode(child);
            if (!childMap.has(node.id)) childMap.set(node.id, new Set());
            childMap.get(node.id)!.add(child.id);
            walk(child);
        }
    };

    for (const node of input) {
        walk(node);
    }

    for (const node of nodeMap.values()) {
        if (node.parentId && nodeMap.has(node.parentId)) {
            if (!childMap.has(node.parentId)) childMap.set(node.parentId, new Set());
            childMap.get(node.parentId)!.add(node.id);
        }
    }

    const roots = Array.from(nodeMap.values())
        .filter((node) => !node.parentId || !nodeMap.has(node.parentId))
        .sort((a, b) => a.name.localeCompare(b.name));

    const options: CollectionFilterOption[] = [];
    const visited = new Set<string>();

    const visit = (node: CollectionNode, level: number) => {
        if (visited.has(node.id)) return;
        visited.add(node.id);
        options.push({ id: node.id, name: node.name, level });

        const childIds = Array.from(childMap.get(node.id) || []);
        const sortedChildren = childIds
            .map((childId) => nodeMap.get(childId))
            .filter(Boolean)
            .sort((a, b) => a!.name.localeCompare(b!.name)) as CollectionNode[];

        for (const child of sortedChildren) {
            visit(child, level + 1);
        }
    };

    for (const root of roots) {
        visit(root, 0);
    }

    for (const remaining of nodeMap.values()) {
        if (!visited.has(remaining.id)) {
            visit(remaining, 0);
        }
    }

    return options;
}

export default function ProductsPage() {

    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);

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
    const [collections, setCollections] = useState<CollectionFilterOption[]>([]);
    const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

    const fetchProducts = async () => {
        try {
            const productService = new ProductService();
            const data = await productService.getProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (error: any) {
            console.error('Error fetching products:', {
                message: error.message,
                statusCode: error.statusCode,
                error: error
            });
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch products',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCollections = async () => {
        try {
            const collectionService = new CollectionService();
            const data = await collectionService.getCollections({ includeChildren: true } as any);
            const collectionOptions = buildCollectionFilterOptions(data as CollectionNode[]);
            setCollections(collectionOptions);
        } catch (error: any) {
            console.error('Error fetching collections:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const brandService = new BrandService();
            const data = await brandService.getBrands();
            setBrands(data);
        } catch (error: any) {
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

        if (selectedCollection && selectedCollection !== 'none') {
            filtered = filtered.filter(product =>
                product.collections?.some(pc => pc.collection.id === selectedCollection) || false
            );
        }

        // Brand filter
        if (selectedBrand && selectedBrand !== 'none') {
            filtered = filtered.filter(product =>
                (product as any).brandId === selectedBrand
            );
        }

        // Status filter
        if (selectedStatus && selectedStatus !== 'none') {
            filtered = filtered.filter(product =>
                selectedStatus === 'active' ? product.enabled : !product.enabled
            );
        }

        // Condition filter
        if (selectedCondition && selectedCondition !== 'none') {
            filtered = filtered.filter(product =>
                (product as any).condition === selectedCondition
            );
        }

        if (selectedStockStatus && selectedStockStatus !== 'none') {
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
        selectedCollection && selectedCollection !== 'none',
        selectedBrand && selectedBrand !== 'none',
        selectedStatus && selectedStatus !== 'none',
        selectedCondition && selectedCondition !== 'none',
        selectedStockStatus && selectedStockStatus !== 'none',
        minPrice,
        maxPrice
    ].filter(Boolean).length;

    // Pagination calculations
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
            toast({
                title: 'Export failed',
                description: 'Failed to export products',
                variant: 'error',
            });
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
            toast({
                title: 'Download failed',
                description: 'Failed to download template',
                variant: 'error',
            });
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <ProductFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedCollection={selectedCollection}
                    setSelectedCollection={setSelectedCollection}
                    selectedBrand={selectedBrand}
                    setSelectedBrand={setSelectedBrand}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    selectedCondition={selectedCondition}
                    setSelectedCondition={setSelectedCondition}
                    selectedStockStatus={selectedStockStatus}
                    setSelectedStockStatus={setSelectedStockStatus}
                    minPrice={minPrice}
                    setMinPrice={setMinPrice}
                    maxPrice={maxPrice}
                    setMaxPrice={setMaxPrice}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    activeFiltersCount={activeFiltersCount}
                    clearFilters={clearFilters}
                    collections={collections}
                    brands={brands}
                    filteredProductsCount={filteredProducts.length}
                    totalProductsCount={products.length}
                />

                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Products</h1>
                        <p className="text-gray-600">Manage your product catalog</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 border-gray-200"
                        >
                            <FileDown className="w-4 h-4" />
                            Download Template
                        </Button>
                        <Button
                            variant="default"
                            onClick={() => setShowImportModal(true)}
                            className="bg-primary-700 hover:bg-primary-800 text-white flex items-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import Products
                        </Button>
                        <Button
                            variant="default"
                            onClick={handleExport}
                            className="bg-primary-600 hover:bg-primary-700 text-white flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Products
                        </Button>
                        <Button asChild className="bg-primary-800 hover:bg-primary-900 text-white">
                            <Link
                                href="/admin/products/new"
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading products...</p>
                    </div>
                ) : filteredProducts.length === 0 && products.length > 0 ? (
                    <Card className="p-8 border-gray-200 shadow-xs">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No products match your filters</h3>
                            <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                className="flex items-center gap-2 border-gray-200"
                            >
                                <X className="w-4 h-4" />
                                Clear All Filters
                            </Button>
                        </div>
                    </Card>
                ) : products.length === 0 ? (
                    <Card className="p-8 border-gray-200 shadow-xs">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="w-12 h-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                            <p className="text-muted-foreground mb-6">Get started by adding your first product</p>
                            <Button asChild className="bg-[#FF5023] hover:bg-[#E04520] text-white">
                                <Link
                                    href="/admin/products/new"
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Your First Product
                                </Link>
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        <ProductTable
                            products={paginatedProducts}
                            onDelete={handleDelete}
                        />
                        <ProductPagination
                            totalItems={filteredProducts.length}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(num) => {
                                setItemsPerPage(num);
                                setCurrentPage(1);
                            }}
                        />
                    </>
                )}

                <ImportProductsModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onImportSuccess={fetchProducts}
                />

                <AlertModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                    title="Delete Product"
                    description={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
                />
            </AdminLayout>
        </ProtectedRoute >
    );
}
