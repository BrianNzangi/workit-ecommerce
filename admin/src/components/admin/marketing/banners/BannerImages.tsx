'use client';

import { Monitor, Smartphone, Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import { AssetService, Asset } from '@/lib/services';

interface BannerImagesProps {
    position: string;
    selectedDesktopAsset: Asset | null;
    selectedMobileAsset: Asset | null;
    onDesktopAssetChange: (asset: Asset | null) => void;
    onMobileAssetChange: (asset: Asset | null) => void;
    loadingAssets: boolean;
    setLoadingAssets: (loading: boolean) => void;
}

export function BannerImages({
    position,
    selectedDesktopAsset,
    selectedMobileAsset,
    onDesktopAssetChange,
    onMobileAssetChange,
    loadingAssets,
    setLoadingAssets
}: BannerImagesProps) {
    const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
        try {
            setLoadingAssets(true);
            const assetService = new AssetService();
            const data = await assetService.uploadAsset({
                file: file,
                fileName: file.name,
                mimeType: file.type,
                folder: 'banners'
            });

            const asset = (data as any).asset || data;

            if (type === 'desktop') {
                onDesktopAssetChange(asset);
            } else {
                onMobileAssetChange(asset);
            }

            toast({
                title: 'Success',
                description: `${type === 'desktop' ? 'Desktop' : 'Mobile'} image uploaded successfully`,
                variant: 'success',
            });
        } catch (error) {
            console.error('Upload error:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload image',
                variant: 'error',
            });
        } finally {
            setLoadingAssets(false);
        }
    };

    const getDimensionsText = (imageType: 'desktop' | 'mobile') => {
        if (position === 'HERO') {
            return imageType === 'desktop' ? '(1200 × 630px)' : '(1080 × 608px)';
        }
        if (position === 'DEALS') {
            return imageType === 'desktop' ? '(310 × 215px)' : '(310 × 165px)';
        }
        if (['DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM'].includes(position)) {
            return imageType === 'desktop' ? '(1200 × 210px)' : '(1080 × 210px)';
        }
        return '';
    };

    const getRecommendationText = () => {
        if (position === 'HERO') {
            return 'Desktop - 1200 × 630 pixels, Mobile - 1080 × 608 pixels';
        }
        if (position === 'DEALS') {
            return 'Desktop: 310 × 215px (16:11), Mobile: 310 × 165px (16:8.5)';
        }
        if (['DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM'].includes(position)) {
            return 'Desktop: 1200 × 210px, Mobile: 1080 × 210px';
        }
        return '';
    };

    const recommendationText = getRecommendationText();

    return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Banner Images</h3>

            {recommendationText && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                        <strong>Recommended dimensions:</strong> {recommendationText}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Desktop Image */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Desktop Image
                        {getDimensionsText('desktop') && (
                            <span className="text-xs text-gray-500 font-normal">
                                {getDimensionsText('desktop')}
                            </span>
                        )}
                    </label>
                    {selectedDesktopAsset ? (
                        <div className="relative aspect-video rounded-lg border-2 border-primary-800 bg-gray-50">
                            <img
                                src={getImageUrl(selectedDesktopAsset.preview || selectedDesktopAsset.source)}
                                alt="Desktop Banner"
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onDesktopAssetChange(null)}
                                    className="bg-primary-800 text-white p-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-600 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                            {loadingAssets ? (
                                <>
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mb-2"></div>
                                    <span className="text-sm text-gray-500 font-medium">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={loadingAssets}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        await handleImageUpload(file, 'desktop');
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>

                {/* Mobile Image */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        Mobile Image
                        {getDimensionsText('mobile') && (
                            <span className="text-xs text-gray-500 font-normal">
                                {getDimensionsText('mobile')}
                            </span>
                        )}
                    </label>
                    {selectedMobileAsset ? (
                        <div className="relative aspect-video rounded-lg border-2 border-primary-800 bg-gray-50">
                            <img
                                src={getImageUrl(selectedMobileAsset.preview || selectedMobileAsset.source)}
                                alt="Mobile Banner"
                                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onMobileAssetChange(null)}
                                    className="bg-primary-800 text-white p-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="relative aspect-video rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary-600 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                            {loadingAssets ? (
                                <>
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800 mb-2"></div>
                                    <span className="text-sm text-gray-500 font-medium">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500 font-medium">Click to upload or drag and drop</span>
                                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</span>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={loadingAssets}
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        await handleImageUpload(file, 'mobile');
                                        e.target.value = '';
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    );
}
