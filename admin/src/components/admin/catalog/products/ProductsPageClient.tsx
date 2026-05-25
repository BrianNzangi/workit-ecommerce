'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { ProductService, CollectionService, BrandService } from '@/lib/services';

import { Package, Plus, FileDown, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AlertModal } from '@/components/ui/alert-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { ProductTable } from './list/ProductTable';
import { ProductFilters } from './list/ProductFilters';
import { ProductPagination } from './list/ProductPagination';
import { ImportExportDrawer } from './import/ImportExportDrawer';
import type { AdminProduct } from '@/lib/products/product.types';

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

export default function ProductsPageClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const isFirstFilterRun = useRef(true);

    const [products, setProducts] = useState<AdminProduct[]>([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalProductsAll, setTotalProductsAll] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedCondition, setSelectedCondition] = useState('');
    const [selectedStockStatus, setSelectedStockStatus] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [currentPage, setCurrentPage] = useState(() => {
        const pageParam = Number(searchParams.get('page') ?? '1');
        return Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    });
    const [itemsPerPage, setItemsPerPage] = useState(() => {
        const perPageParam = Number(searchParams.get('perPage') ?? '50');
        return Number.isFinite(perPageParam) && perPageParam > 0 ? perPageParam : 50;
    });

    const [collections, setCollections] = useState<CollectionFilterOption[]>([]);
    const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productService = new ProductService();
            const parsedMinPrice = minPrice.trim() === '' ? undefined : Number(minPrice);
            const parsedMaxPrice = maxPrice.trim() === '' ? undefined : Number(maxPrice);
            const response = await productService.getProductsPage({
                limit: itemsPerPage,
                offset: (currentPage - 1) * itemsPerPage,
                q: searchTerm.trim() || undefined,
                collectionId: selectedCollection && selectedCollection !== 'none' ? selectedCollection : undefined,
                brandId: selectedBrand && selectedBrand !== 'none' ? selectedBrand : undefined,
                enabled: selectedStatus === 'active' ? true : selectedStatus === 'draft' ? false : undefined,
                condition: selectedCondition && selectedCondition !== 'none' ? selectedCondition : undefined,
                stockStatus: selectedStockStatus && selectedStockStatus !== 'none' ? selectedStockStatus : undefined,
                minPrice: Number.isFinite(parsedMinPrice) ? parsedMinPrice : undefined,
                maxPrice: Number.isFinite(parsedMaxPrice) ? parsedMaxPrice : undefined,
                includeTotalAll: true,
            });
            setProducts(response.products || []);
            const total = Number(response.total || 0);
            const totalAll = Number(response.totalAll ?? total);
            setTotalProducts(total);
            setTotalProductsAll(totalAll);

            const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
            if (currentPage > totalPages) {
                setCurrentPage(totalPages);
            }
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
        fetchCollections();
        fetchBrands();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [
        currentPage,
        itemsPerPage,
        searchTerm,
        selectedCollection,
        selectedBrand,
        selectedStatus,
        selectedCondition,
        selectedStockStatus,
        minPrice,
        maxPrice,
    ]);

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

    const resolvedTotalProducts = Math.max(totalProducts, products.length);
    const resolvedTotalAll = Math.max(totalProductsAll, resolvedTotalProducts);
    const hasProducts = products.length > 0;

    useEffect(() => {
        if (isFirstFilterRun.current) {
            isFirstFilterRun.current = false;
            return;
        }
        if (currentPage !== 1) setCurrentPage(1);
    }, [searchTerm, selectedCollection, selectedBrand, selectedStatus, selectedCondition, selectedStockStatus, minPrice, maxPrice]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        const pageValue = String(currentPage);
        const perPageValue = String(itemsPerPage);
        if (params.get('page') === pageValue && params.get('perPage') === perPageValue) return;
        params.set('page', pageValue);
        params.set('perPage', perPageValue);
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [currentPage, itemsPerPage, router, searchParams]);

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

    return (
        <ProtectedRoute>
            <AdminLayout>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
                            <div className="flex items-center gap-2">
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
                                    filteredProductsCount={resolvedTotalProducts}
                                    totalProductsCount={resolvedTotalAll}
                                />
                                <Button variant="outline" onClick={() => setShowImportModal(true)} className="gap-2">
                                    <FileDown className="h-4 w-4" />
                                    Import
                                </Button>
                                <Button asChild>
                                    <Link href="/admin/products/new" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Product
                                    </Link>
                                </Button>
                            </div>
                        </div>

                    {loading ? (
                        <div className="space-y-3 rounded-md border p-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <Skeleton className="h-10 w-10 rounded-md" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : !hasProducts && resolvedTotalAll > 0 && activeFiltersCount > 0 ? (
                        <Card className="border">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No products match your filters</h3>
                                <p className="text-muted-foreground mb-6">Try adjusting your filters to see more results</p>
                                <Button variant="outline" onClick={clearFilters} className="gap-2">
                                    <X className="h-4 w-4" />
                                    Clear All Filters
                                </Button>
                            </CardContent>
                        </Card>
                    ) : !hasProducts ? (
                        <Card className="border">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                                <p className="text-muted-foreground mb-6">Get started by adding your first product</p>
                                <Button asChild>
                                    <Link href="/admin/products/new" className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Your First Product
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            <ProductTable products={products} onDelete={handleDelete} />
                            <ProductPagination
                                totalItems={resolvedTotalProducts}
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
                </div>

                <ImportExportDrawer
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
        </ProtectedRoute>
    );
}
