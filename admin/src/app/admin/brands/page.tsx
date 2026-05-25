'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { BrandService } from '@/lib/services/brands/brand.service';
import {
    Brand,
    BrandsHeader,
    BrandsStats,
    BrandsToolbar,
    BrandsLoadingState,
    BrandsEmptyState,
    BrandsDeleteDialog,
    BrandsTable,
} from '@/components/admin/catalog/brands';

interface BrandToDelete {
    id: string;
    name: string;
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<BrandToDelete | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBrands = useCallback(async () => {
        try {
            setLoading(true);
            const service = new BrandService();
            const data = await service.getBrands();
            setBrands(data as unknown as Brand[]);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast({
                title: 'Error',
                description: 'Failed to load brands',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    const openDeleteDialog = useCallback((brandId: string, brandName: string) => {
        setBrandToDelete({ id: brandId, name: brandName });
        setDeleteDialogOpen(true);
    }, []);

    const closeDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        setBrandToDelete(null);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!brandToDelete) return;

        setDeleteLoading(true);
        try {
            const service = new BrandService();
            await service.deleteBrand(brandToDelete.id);

            toast({
                title: 'Brand deleted',
                description: `"${brandToDelete.name}" has been successfully deleted.`,
                variant: 'success',
            });

            await fetchBrands();
            closeDeleteDialog();
        } catch (error: any) {
            console.error('Error deleting brand:', error);
            toast({
                title: 'Delete failed',
                description: error.message || 'Failed to delete brand',
                variant: 'error',
            });
        } finally {
            setDeleteLoading(false);
        }
    }, [brandToDelete, fetchBrands, closeDeleteDialog]);

    const filteredBrands = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return brands;

        return brands.filter(
            (brand) =>
                brand.name.toLowerCase().includes(normalizedSearch) ||
                brand.slug.toLowerCase().includes(normalizedSearch) ||
                (brand.description || '').toLowerCase().includes(normalizedSearch)
        );
    }, [brands, searchTerm]);

    const showStats = !loading && brands.length > 0;
    const showEmpty = !loading && brands.length === 0;
    const showNoResults = !loading && brands.length > 0 && filteredBrands.length === 0;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <BrandsHeader />

                {showStats && <BrandsStats brands={brands} />}

                {loading ? (
                    <BrandsLoadingState />
                ) : showEmpty ? (
                    <BrandsEmptyState />
                ) : (
                    <>
                        <BrandsToolbar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            totalCount={brands.length}
                            filteredCount={filteredBrands.length}
                        />

                        {showNoResults ? (
                            <BrandsEmptyState searchTerm={searchTerm} />
                        ) : (
                            <BrandsTable
                                brands={filteredBrands}
                                searchTerm={searchTerm}
                                onDelete={openDeleteDialog}
                            />
                        )}
                    </>
                )}

                <BrandsDeleteDialog
                    open={deleteDialogOpen}
                    loading={deleteLoading}
                    brandName={brandToDelete?.name}
                    onOpenChange={(open) => {
                        if (!open) closeDeleteDialog();
                    }}
                    onConfirm={confirmDelete}
                />
            </AdminLayout>
        </ProtectedRoute>
    );
}
