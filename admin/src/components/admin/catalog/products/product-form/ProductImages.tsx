'use client';

import { Upload, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { getImageUrl } from '@/lib/shared/images';

interface ProductImagesProps {
    existingImages: Array<{ id: string; assetId: string; url: string }>;
    imagePreviews: string[];
    selectedFiles: File[];
    handleImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeExistingImage: (index: number) => void;
    removeNewImage: (index: number) => void;
}

export function ProductImages({
    existingImages,
    imagePreviews,
    selectedFiles,
    handleImageSelect,
    removeExistingImage,
    removeNewImage,
}: ProductImagesProps) {
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-secondary-900">Images</h2>
                <p className="text-xs text-secondary-400 mt-0.5">Product photos — first image is the main image</p>
            </div>
            <div className="space-y-4">
                {existingImages.length > 0 && (
                    <div className="space-y-2">
                        <Label>Current Images</Label>
                    <div className="grid grid-cols-6 gap-1.5">
                        {existingImages.map((image, index) => (
                            <div key={image.id} className="relative group">
                                <div className="aspect-square w-full rounded-md border border-secondary-100 bg-secondary-50 overflow-hidden">
                                    <img
                                        src={getImageUrl(image.url)}
                                        alt={`Product image ${index + 1}`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                                {index === 0 && (
                                    <Badge className="absolute top-0.5 left-0.5 h-3.5 px-1 text-[7px]">
                                        Main
                                    </Badge>
                                )}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeExistingImage(index)}
                                    className="absolute top-0.5 right-0.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                {imagePreviews.length > 0 && (
                    <div className="space-y-2">
                        <Label>New Images</Label>
                    <div className="grid grid-cols-6 gap-1.5">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square w-full rounded-md border border-secondary-100 bg-secondary-50 overflow-hidden">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                {index === 0 && existingImages.length === 0 && (
                                    <Badge className="absolute top-0.5 left-0.5 h-3.5 px-1 text-[7px]">
                                        Main
                                    </Badge>
                                )}
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-0.5 right-0.5 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Upload</Label>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild className="gap-2 cursor-pointer">
                            <label>
                                <Upload className="h-4 w-4" />
                                Choose Files
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                            </label>
                        </Button>
                        {selectedFiles.length > 0 && (
                            <span className="text-xs text-secondary-400">
                                {selectedFiles.length} file(s) selected
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-secondary-400">
                        JPEG, PNG, WebP, GIF — max 10MB each
                    </p>
                </div>
            </div>
        </div>
    );
}
