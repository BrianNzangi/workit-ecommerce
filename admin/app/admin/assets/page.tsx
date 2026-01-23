'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Upload, Image as ImageIcon, Trash2, X } from 'lucide-react';
import { Toaster } from '@/components/ui/toast-container';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/image-utils';

interface Asset {
    id: string;
    name: string;
    type: string;
    mimeType: string;
    fileSize: number;
    source: string;
    preview: string;
    width: number | null;
    height: number | null;
    createdAt: string;
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; assetId: string | null }>({
        show: false,
        assetId: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalAssets, setTotalAssets] = useState(0);
    const assetsPerPage = 32;

    const fetchAssets = async (page: number = 1) => {
        try {
            setLoading(true);
            const skip = (page - 1) * assetsPerPage;
            const response = await fetch(`/api/admin/assets?take=${assetsPerPage}&skip=${skip}`);
            if (response.ok) {
                const data = await response.json();
                setAssets(data);

                // Fetch total count
                const countResponse = await fetch('/api/admin/assets?take=1000');
                if (countResponse.ok) {
                    const allData = await countResponse.json();
                    setTotalAssets(allData.length);
                }
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);

        try {
            let successCount = 0;
            let failCount = 0;

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'assets');

                const response = await fetch('/api/admin/assets', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            }

            // Refresh assets list
            setCurrentPage(1);
            await fetchAssets(1);
            setShowUploadModal(false);
            setSelectedFiles([]);

            // Show success toast
            if (successCount > 0) {
                toast({
                    title: 'Upload Successful',
                    description: `${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`,
                    variant: 'success',
                });
            }

            // Show error toast if any failed
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

    const handleDelete = async (assetId: string) => {
        setDeleteConfirm({ show: true, assetId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm.assetId) return;

        try {
            const response = await fetch(`/api/admin/assets/${deleteConfirm.assetId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchAssets(currentPage);
                toast({
                    title: 'Asset Deleted',
                    description: 'Asset has been successfully deleted',
                    variant: 'success',
                });
            } else {
                toast({
                    title: 'Delete Failed',
                    description: 'Failed to delete asset',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            toast({
                title: 'Delete Error',
                description: 'An unexpected error occurred while deleting the asset',
                variant: 'error',
            });
        } finally {
            setDeleteConfirm({ show: false, assetId: null });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Assets</h1>
                        <p className="text-gray-600">Manage your media files</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-xs transition-colors shadow-xs"
                    >
                        <Upload className="w-4 h-4" />
                        Upload Assets
                    </button>
                </div>

                {loading ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <p className="text-center text-gray-500">Loading assets...</p>
                    </div>
                ) : assets.length === 0 ? (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                        <div className="text-center py-12">
                            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assets yet</h3>
                            <p className="text-gray-600 mb-4">Upload your first image or file</p>
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-xs transition-colors shadow-xs"
                            >
                                <Upload className="w-4 h-4" />
                                Upload Your First Asset
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-4">
                            {assets.map((asset) => (
                                <div
                                    key={asset.id}
                                    className="group relative border border-gray-200 rounded-xs overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    {/* Image Preview */}
                                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                                        {asset.type === 'IMAGE' ? (
                                            <img
                                                src={getImageUrl(asset.preview)}
                                                alt={asset.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-12 h-12 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(asset.id)}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Asset Info */}
                                    <div className="p-3 bg-white">
                                        <p className="text-sm font-medium text-gray-900 truncate" title={asset.name}>
                                            {asset.name}
                                        </p>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-xs text-gray-500">{asset.type}</span>
                                            <span className="text-xs text-gray-500">{formatFileSize(asset.fileSize)}</span>
                                        </div>
                                        {asset.width && asset.height && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {asset.width} × {asset.height}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalAssets > assetsPerPage && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                <div className="text-sm text-gray-600">
                                    Showing {((currentPage - 1) * assetsPerPage) + 1} to {Math.min(currentPage * assetsPerPage, totalAssets)} of {totalAssets} assets
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2 px-4">
                                        <span className="text-sm text-gray-600">
                                            Page {currentPage} of {Math.ceil(totalAssets / assetsPerPage)}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalAssets / assetsPerPage), prev + 1))}
                                        disabled={currentPage >= Math.ceil(totalAssets / assetsPerPage)}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full animate-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Upload Assets</h2>
                                    <p className="text-sm text-gray-500 mt-1">Add images and files to your media library</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFiles([]);
                                    }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-900 transition-colors bg-gray-50/50">
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8 text-primary-900" />
                                        </div>
                                        <label className="cursor-pointer">
                                            <span className="text-base font-medium text-gray-900">
                                                Click to select files
                                            </span>
                                            <span className="text-base text-gray-500"> or drag and drop</span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            PNG, JPG, WebP, GIF up to 10MB each
                                        </p>
                                    </div>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-semibold text-gray-900">
                                                Selected Files
                                            </p>
                                            <span className="text-sm text-gray-500">
                                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                                                            <ImageIcon className="w-5 h-5 text-primary-900" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                                                        }}
                                                        className="ml-2 p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setSelectedFiles([]);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={selectedFiles.length === 0 || uploading}
                                    className="flex-1 px-4 py-2.5 bg-primary-900 hover:bg-primary-800 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Uploading...
                                        </span>
                                    ) : (
                                        `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm.show && (
                    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xs shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Asset</h2>
                                <p className="text-gray-600">
                                    Are you sure you want to delete this asset? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={() => setDeleteConfirm({ show: false, assetId: null })}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xs transition-colors shadow-xs"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AdminLayout>
            <Toaster />
        </ProtectedRoute>
    );
}
