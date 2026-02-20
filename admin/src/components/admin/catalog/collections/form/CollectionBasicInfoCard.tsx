import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CollectionFormData } from './types';

interface CollectionBasicInfoCardProps {
    formData: CollectionFormData;
    imagePreview: string;
    onFieldChange: (field: keyof CollectionFormData, value: string | number | boolean) => void;
    onImageChange: (file: File | null) => void;
    onClearImage: () => void;
}

export function CollectionBasicInfoCard({
    formData,
    imagePreview,
    onFieldChange,
    onImageChange,
    onClearImage,
}: CollectionBasicInfoCardProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle>Collection Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Collection Name *</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(event) => onFieldChange('name', event.target.value)}
                        placeholder="e.g., Electronics"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug *</Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(event) => onFieldChange('slug', event.target.value)}
                        placeholder="electronics"
                        required
                    />
                    <p className="text-xs text-gray-500">Auto-generated from collection name</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(event) => onFieldChange('description', event.target.value)}
                        placeholder="Enter collection description..."
                        rows={5}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="image">Collection Image</Label>
                    {imagePreview ? (
                        <div className="relative h-72 w-full overflow-hidden rounded-xs border border-gray-300 bg-gray-50">
                            <div className="flex h-full w-full items-center justify-center p-3">
                                <img
                                    src={imagePreview}
                                    alt="Collection preview"
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={onClearImage}
                                className="absolute right-2 top-2 h-8 w-8 rounded-xs"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : null}

                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={(event) => onImageChange(event.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500">Upload an image for this collection (optional)</p>
                </div>
            </CardContent>
        </Card>
    );
}
