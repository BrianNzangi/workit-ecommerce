'use client';

import { useCallback, useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertModal } from '@/components/ui/alert-modal';
import { toast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toast-container';
import { Upload, Trash2, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';
import { getImageUrl } from '@/lib/shared/images/image-utils';
import {
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    ensureCsrfToken,
    getCookieValue,
    getSessionUrl,
} from '@/lib/auth/csrf';

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

const AUTH_BASE_PATH = process.env.NEXT_PUBLIC_AUTH_BASE_PATH?.trim() || '/api/auth';
const AUTH_BASE_URL =
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_ADMIN_BASE_URL?.trim() ||
    'http://localhost:3002';
const AUTH_SESSION_URL = getSessionUrl(AUTH_BASE_PATH, AUTH_BASE_URL);

function formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function AssetImage({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false);

    if (error) {
        return <ImageIcon className="w-8 h-8 text-gray-300" />;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
        />
    );
}

function FilePreviewItem({ file, onRemove }: { file: File; onRemove: () => void }) {
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [file]);

    return (
        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            {file.type.startsWith('image/') && previewUrl ? (
                <img src={previewUrl} alt={file.name} className="w-10 h-10 rounded object-cover shrink-0" />
            ) : (
                <ImageIcon className="w-4 h-4 text-gray-400 shrink-0" />
            )}
            <span className="text-sm truncate flex-1">{file.name}</span>
            <span className="text-xs text-gray-400 shrink-0">{formatFileSize(file.size)}</span>
            <button onClick={onRemove}>
                <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
            </button>
        </div>
    );
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ mode: 'single' | 'bulk'; id?: string }>({ mode: 'single' });
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const perPage = 32;

    const fetchAssets = useCallback(async (p: number) => {
        try {
            setLoading(true);
            const skip = (p - 1) * perPage;
            const res = await fetch(`/api/admin/assets?take=${perPage}&skip=${skip}`);
            if (!res.ok) return;
            const data = await res.json();
            setAssets(Array.isArray(data) ? data : []);
            setSelectedIds([]);

            const countRes = await fetch(`/api/admin/assets?take=1&skip=0`);
            if (countRes.ok) {
                const allRes = await fetch(`/api/admin/assets?take=10000`);
                if (allRes.ok) {
                    const allData = await allRes.json();
                    setTotal(Array.isArray(allData) ? allData.length : 0);
                }
            }
        } catch (e) {
            console.error('Failed to fetch assets:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssets(page);
    }, [page, fetchAssets]);

    const handleUpload = async () => {
        if (!selectedFiles.length) return;
        setUploading(true);
        let success = 0;
        let failed = 0;

        for (const file of selectedFiles) {
            try {
                await uploadAdminAsset({ file });
                success++;
            } catch (e) {
                console.error('Upload failed:', e);
                failed++;
            }
        }

        setUploading(false);
        setSelectedFiles([]);
        setUploadDialogOpen(false);
        setPage(1);
        fetchAssets(1);

        if (success) toast({ title: 'Upload complete', description: `${success} file(s) uploaded`, variant: 'success' });
        if (failed) toast({ title: 'Upload errors', description: `${failed} file(s) failed`, variant: 'error' });
    };

    const handleDelete = async () => {
        try {
            const csrfToken = (await ensureCsrfToken(AUTH_SESSION_URL)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            if (csrfToken) {
                headers[CSRF_HEADER_NAME] = csrfToken;
            }

            const res = deleteTarget.mode === 'single'
                ? await fetch(`/api/admin/assets/${deleteTarget.id}`, {
                    method: 'DELETE',
                    headers,
                    credentials: 'include',
                })
                : await fetch('/api/admin/assets/bulk-delete', {
                    method: 'POST',
                    headers,
                    credentials: 'include',
                    body: JSON.stringify({ ids: selectedIds }),
                });

            if (!res.ok) {
                toast({ title: 'Delete failed', description: 'Could not delete asset(s)', variant: 'error' });
                return;
            }

            setDeleteDialogOpen(false);
            if (deleteTarget.mode === 'bulk') setSelectedIds([]);
            fetchAssets(page);
            toast({ title: 'Deleted', description: 'Asset(s) removed', variant: 'success' });
        } catch (e) {
            toast({ title: 'Delete error', description: 'An error occurred', variant: 'error' });
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === assets.length && assets.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(assets.map(a => a.id));
        }
    };

    const totalPages = Math.ceil(total / perPage);

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">Assets</h1>
                            <p className="text-sm text-gray-500 mt-1">{total} file{total !== 1 ? 's' : ''}</p>
                        </div>
                        <Button onClick={() => setUploadDialogOpen(true)}>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </Button>
                    </div>

                    {selectedIds.length > 0 && (
                        <Card className="bg-white p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
                                <Button variant="destructive" size="sm" onClick={() => {
                                    setDeleteTarget({ mode: 'bulk' });
                                    setDeleteDialogOpen(true);
                                }}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="aspect-square bg-gray-100 animate-pulse" />
                            ))}
                        </div>
                    ) : assets.length === 0 ? (
                        <Card className="bg-white p-12 text-center">
                            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
                            <p className="text-sm text-gray-500 mb-4">Upload images and files to get started</p>
                            <Button onClick={() => setUploadDialogOpen(true)}>
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Files
                            </Button>
                        </Card>
                    ) : (
                        <>
                            <Card className="bg-white">
                                <div className="p-4 border-b border-gray-100">
                                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                        <Checkbox
                                            checked={assets.length > 0 && selectedIds.length === assets.length}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                        Select all
                                    </label>
                                </div>
                                <div className="p-4">
                                    <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
                                        {assets.map(asset => (
                                            <div
                                                key={asset.id}
                                                className="group relative rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow"
                                            >
                                                <div className="absolute top-2 left-2 z-10">
                                                    <Checkbox
                                                        checked={selectedIds.includes(asset.id)}
                                                        onCheckedChange={(e) => {
                                                            toggleSelect(asset.id);
                                                        }}
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDeleteTarget({ mode: 'single', id: asset.id });
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <div
                                                    className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer"
                                                    onClick={() => setPreviewAsset(asset)}
                                                >
                                                    {asset.type === 'IMAGE' ? (
                                                        <AssetImage src={getImageUrl(asset.preview || asset.source)} alt={asset.name} />
                                                    ) : (
                                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <p className="truncate text-xs font-medium text-gray-900" title={asset.name}>
                                                        {asset.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(asset.fileSize)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Upload Files</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-600">Click or drag files here</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                                />
                            </label>

                            {selectedFiles.length > 0 && (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {selectedFiles.map((file, i) => (
                                        <FilePreviewItem key={i} file={file} onRemove={() => setSelectedFiles(prev => prev.filter((_, j) => j !== i))} />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); setSelectedFiles([]); }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpload}
                                disabled={!selectedFiles.length || uploading}
                            >
                                {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="truncate">{previewAsset?.name}</DialogTitle>
                        </DialogHeader>
                        {previewAsset && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                                    {previewAsset.type === 'IMAGE' ? (
                                        <img
                                            src={getImageUrl(previewAsset.preview || previewAsset.source)}
                                            alt={previewAsset.name}
                                            className="max-h-[60vh] w-auto object-contain"
                                        />
                                    ) : (
                                        <div className="py-16">
                                            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto" />
                                            <p className="text-sm text-gray-500 mt-2 text-center">Preview not available</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">Type</p>
                                        <p className="font-medium">{previewAsset.type}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">File Size</p>
                                        <p className="font-medium">{formatFileSize(previewAsset.fileSize)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">MIME Type</p>
                                        <p className="font-medium truncate">{previewAsset.mimeType}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Dimensions</p>
                                        <p className="font-medium">
                                            {previewAsset.width && previewAsset.height
                                                ? `${previewAsset.width} x ${previewAsset.height}`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-gray-500">Source URL</p>
                                        <p className="font-medium text-xs text-gray-600 break-all">{previewAsset.source}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertModal
                    isOpen={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                    onConfirm={handleDelete}
                    loading={false}
                    title={`Delete ${deleteTarget.mode === 'bulk' ? `${selectedIds.length} assets` : 'asset'}?`}
                    description="This action cannot be undone. The file(s) will be permanently removed."
                />
            </AdminLayout>
            <Toaster />
        </ProtectedRoute>
    );
}
