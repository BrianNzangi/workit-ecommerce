'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toast-container';
import { toast } from '@/hooks/use-toast';
import {
    Asset,
    AssetsDeleteDialog,
    AssetsEmptyState,
    AssetsGrid,
    AssetsHeader,
    AssetsLoadingState,
    AssetsPagination,
    AssetsToolbar,
    AssetsUploadDialog,
    DeleteMode,
} from '@/components/admin/catalog/assets';
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';

interface DeleteConfirmState {
    show: boolean;
    mode: DeleteMode;
    assetId: string | null;
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
        show: false,
        mode: 'single',
        assetId: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalAssets, setTotalAssets] = useState(0);

    const assetsPerPage = 32;

    const resetUploadState = () => {
        setShowUploadDialog(false);
        setSelectedFiles([]);
    };

    const closeDeleteDialog = () => {
        setDeleteConfirm({ show: false, mode: 'single', assetId: null });
    };

    const fetchAssets = async (page: number = 1) => {
        try {
            setLoading(true);
            const skip = (page - 1) * assetsPerPage;
            const response = await fetch(`/api/admin/assets?take=${assetsPerPage}&skip=${skip}`);
            if (!response.ok) return;

            const data = await response.json();
            setAssets(data);
            setSelectedAssetIds([]);

            const countResponse = await fetch('/api/admin/assets?take=1000');
            if (countResponse.ok) {
                const allData = await countResponse.json();
                setTotalAssets(allData.length);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets(currentPage);
    }, [currentPage]);

    const handleFilesChange = (files: FileList | null) => {
        setSelectedFiles(Array.from(files || []));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const file of selectedFiles) {
                try {
                    await uploadAdminAsset({ file, folder: 'assets' });
                    successCount++;
                } catch (error) {
                    console.error('Error uploading file:', error);
                    failCount++;
                }
            }

            setCurrentPage(1);
            await fetchAssets(1);
            resetUploadState();

            if (successCount > 0) {
                toast({
                    title: 'Upload Successful',
                    description: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`,
                    variant: 'success',
                });
            }

            if (failCount > 0) {
                toast({
                    title: 'Upload Failed',
                    description: `${failCount} file${failCount > 1 ? 's' : ''} failed to upload`,
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error uploading files:', error);
            toast({
                title: 'Upload Error',
                description: 'An unexpected error occurred while uploading files',
                variant: 'error',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSingleDelete = (assetId: string) => {
        setDeleteConfirm({ show: true, mode: 'single', assetId });
    };

    const handleBulkDelete = () => {
        if (selectedAssetIds.length === 0) return;
        setDeleteConfirm({ show: true, mode: 'bulk', assetId: null });
    };

    const toggleAssetSelection = (assetId: string) => {
        setSelectedAssetIds((prev) =>
            prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
        );
    };

    const allVisibleSelected =
        assets.length > 0 && assets.every((asset) => selectedAssetIds.includes(asset.id));

    const toggleSelectAllVisible = () => {
        if (allVisibleSelected) {
            setSelectedAssetIds((prev) => prev.filter((id) => !assets.some((asset) => asset.id === id)));
            return;
        }

        setSelectedAssetIds((prev) => [...new Set([...prev, ...assets.map((asset) => asset.id)])]);
    };

    const confirmDelete = async () => {
        if (deleteConfirm.mode === 'single' && !deleteConfirm.assetId) return;

        try {
            const response =
                deleteConfirm.mode === 'single'
                    ? await fetch(`/api/admin/assets/${deleteConfirm.assetId}`, { method: 'DELETE' })
                    : await fetch('/api/admin/assets/bulk-delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ids: selectedAssetIds }),
                    });

            const result = await response.json().catch(() => null);

            if (response.ok) {
                await fetchAssets(currentPage);
                if (deleteConfirm.mode === 'bulk') {
                    setSelectedAssetIds([]);
                }

                if (deleteConfirm.mode === 'bulk' && result && result.success === false) {
                    const deletedCount = result.count ?? 0;
                    const failedCount = Array.isArray(result.failed) ? result.failed.length : 0;
                    toast({
                        title: 'Bulk Delete Partially Completed',
                        description: `${deletedCount} deleted, ${failedCount} failed`,
                        variant: 'error',
                    });
                } else {
                    toast({
                        title: deleteConfirm.mode === 'single' ? 'Asset Deleted' : 'Assets Deleted',
                        description:
                            deleteConfirm.mode === 'single'
                                ? 'Asset has been successfully deleted'
                                : 'Selected assets have been successfully deleted',
                        variant: 'success',
                    });
                }
            } else {
                toast({
                    title: 'Delete Failed',
                    description:
                        result?.message ||
                        (deleteConfirm.mode === 'single'
                            ? 'Failed to delete asset'
                            : 'Failed to delete selected assets'),
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            toast({
                title: 'Delete Error',
                description:
                    deleteConfirm.mode === 'single'
                        ? 'An unexpected error occurred while deleting the asset'
                        : 'An unexpected error occurred while deleting selected assets',
                variant: 'error',
            });
        } finally {
            closeDeleteDialog();
        }
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <AssetsHeader onUploadClick={() => setShowUploadDialog(true)} />

                {loading ? (
                    <AssetsLoadingState />
                ) : assets.length === 0 ? (
                    <AssetsEmptyState onUploadClick={() => setShowUploadDialog(true)} />
                ) : (
                    <Card className="border-gray-200 shadow-xs">
                        <CardContent className="p-6">
                            <AssetsToolbar
                                allVisibleSelected={allVisibleSelected}
                                selectedCount={selectedAssetIds.length}
                                onToggleSelectAllVisible={toggleSelectAllVisible}
                                onBulkDelete={handleBulkDelete}
                            />

                            <AssetsGrid
                                assets={assets}
                                selectedAssetIds={selectedAssetIds}
                                onToggleAssetSelection={toggleAssetSelection}
                                onDeleteAsset={handleSingleDelete}
                            />

                            <AssetsPagination
                                currentPage={currentPage}
                                totalAssets={totalAssets}
                                assetsPerPage={assetsPerPage}
                                onPageChange={setCurrentPage}
                            />
                        </CardContent>
                    </Card>
                )}

                <AssetsUploadDialog
                    open={showUploadDialog}
                    selectedFiles={selectedFiles}
                    uploading={uploading}
                    onOpenChange={(open) => (open ? setShowUploadDialog(true) : resetUploadState())}
                    onFilesChange={handleFilesChange}
                    onRemoveFile={(index) =>
                        setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index))
                    }
                    onUpload={handleUpload}
                />

                <AssetsDeleteDialog
                    open={deleteConfirm.show}
                    mode={deleteConfirm.mode}
                    selectedCount={selectedAssetIds.length}
                    onOpenChange={(open) => (open ? setDeleteConfirm((prev) => ({ ...prev, show: true })) : closeDeleteDialog())}
                    onConfirm={confirmDelete}
                />
            </AdminLayout>
            <Toaster />
        </ProtectedRoute>
    );
}
