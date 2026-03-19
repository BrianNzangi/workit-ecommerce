'use client';

import { Monitor, Smartphone, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import { Asset } from '@/lib/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDimensionsText, getRecommendationText } from './banner.constants';
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';

interface BannerImagesProps {
    position: string;
    selectedDesktopAsset: Asset | null;
    selectedMobileAsset: Asset | null;
    onDesktopAssetChange: (asset: Asset | null) => void;
    onMobileAssetChange: (asset: Asset | null) => void;
    loadingAssets: boolean;
    setLoadingAssets: (loading: boolean) => void;
    disabled?: boolean;
}

interface UploadCardProps {
    label: string;
    dimensionsText: string;
    selectedAsset: Asset | null;
    loadingAssets: boolean;
    disabled?: boolean;
    onUpload: (file: File) => Promise<void>;
    onClear: () => void;
}

function UploadCard({
    label,
    dimensionsText,
    selectedAsset,
    loadingAssets,
    disabled,
    onUpload,
    onClear,
}: UploadCardProps) {
    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
                {label}
                {dimensionsText ? (
                    <span className="text-xs font-medium text-secondary-400">{dimensionsText}</span>
                ) : null}
            </div>

            {selectedAsset ? (
                <div className="relative aspect-video overflow-hidden rounded-xs border border-primary-200 bg-primary-50">
                    <img
                        src={getImageUrl(selectedAsset.preview || selectedAsset.source)}
                        alt={selectedAsset.name || label}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 top-2 flex gap-2">
                        <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            disabled={disabled || loadingAssets}
                            onClick={onClear}
                            className="h-8 w-8 border-gray-200 bg-white/90 text-secondary-700 hover:bg-white"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <label className={`flex aspect-video cursor-pointer flex-col items-center justify-center rounded-xs border-2 border-dashed border-gray-200 bg-gray-50 text-center transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary-200 hover:bg-primary-50/40'}`}>
                    {loadingAssets ? (
                        <>
                            <div className="mb-2 h-7 w-7 animate-spin rounded-full border-2 border-primary-200 border-b-primary-900" />
                            <span className="text-sm font-medium text-secondary-500">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="mb-2 h-7 w-7 text-secondary-400" />
                            <span className="text-sm font-semibold text-secondary-700">
                                Click to upload
                            </span>
                            <span className="mt-1 text-xs font-medium text-secondary-400">
                                PNG, JPG, WEBP up to 10MB
                            </span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={loadingAssets || disabled}
                        onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            await onUpload(file);
                            event.target.value = '';
                        }}
                    />
                </label>
            )}
        </div>
    );
}

export function BannerImages({
    position,
    selectedDesktopAsset,
    selectedMobileAsset,
    onDesktopAssetChange,
    onMobileAssetChange,
    loadingAssets,
    setLoadingAssets,
    disabled,
}: BannerImagesProps) {
    const recommendationText = getRecommendationText(position);

    const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
        try {
            setLoadingAssets(true);
            const { asset } = await uploadAdminAsset({
                file,
                folder: 'banners',
            });
            if (type === 'desktop') {
                onDesktopAssetChange(asset);
            } else {
                onMobileAssetChange(asset);
            }

            toast({
                title: 'Image uploaded',
                description: `${type === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded successfully.`,
                variant: 'success',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload failed',
                description: 'Failed to upload image.',
                variant: 'error',
            });
        } finally {
            setLoadingAssets(false);
        }
    };

    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-secondary-900">
                    Banner Images
                </CardTitle>
                <CardDescription className="font-medium text-secondary-500">
                    Upload desktop and mobile variants for this banner.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                {recommendationText ? (
                    <div className="rounded-xs border border-primary-100 bg-primary-50 px-3 py-2.5">
                        <p className="text-xs font-semibold text-primary-900">
                            Recommended dimensions: {recommendationText}
                        </p>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <UploadCard
                        label="Desktop Image"
                        dimensionsText={getDimensionsText(position, 'desktop')}
                        selectedAsset={selectedDesktopAsset}
                        loadingAssets={loadingAssets}
                        disabled={disabled}
                        onUpload={(file) => handleImageUpload(file, 'desktop')}
                        onClear={() => onDesktopAssetChange(null)}
                    />

                    <UploadCard
                        label="Mobile Image"
                        dimensionsText={getDimensionsText(position, 'mobile')}
                        selectedAsset={selectedMobileAsset}
                        loadingAssets={loadingAssets}
                        disabled={disabled}
                        onUpload={(file) => handleImageUpload(file, 'mobile')}
                        onClear={() => onMobileAssetChange(null)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 text-xs font-semibold text-secondary-500 sm:grid-cols-2">
                    <div className="inline-flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-secondary-400" />
                        Desktop image is used for wider screens.
                    </div>
                    <div className="inline-flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-secondary-400" />
                        Mobile image is used for smaller screens.
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
