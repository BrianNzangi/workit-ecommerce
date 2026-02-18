'use client';

import { Upload, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card>
            <CardHeader>
                <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="space-y-2">
                        <Label>Current Images</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {existingImages.map((image, index) => (
                                <div key={image.id} className="relative group">
                                    <div className="w-full h-20 bg-muted rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                                        <img
                                            src={getImageUrl(image.url)}
                                            alt={`Product image ${index + 1}`}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </Button>
                                    {index === 0 && (
                                        <Badge className="absolute bottom-1 left-1 px-1.5 py-0 text-[10px]">
                                            Main
                                        </Badge>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Upload Images</Label>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" asChild className="cursor-pointer">
                            <label className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
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
                        <span className="text-sm text-muted-foreground">
                            {selectedFiles.length} file(s) selected
                        </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Supported: JPEG, PNG, WebP, GIF (Max 10MB each)
                    </p>
                </div>

                {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-2">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                                <div className="w-full h-20 bg-muted rounded-md border border-gray-200 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => removeNewImage(index)}
                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
