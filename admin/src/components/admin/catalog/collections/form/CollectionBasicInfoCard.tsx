import { X, Upload, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CollectionFormData } from './types';
import { useCallback, useRef, useState } from 'react';

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
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageChange(file);
        }
    }, [onImageChange]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onImageChange(file);
    }, [onImageChange]);

    return (
        <div className="bg-white p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">Collection Information</h2>

            <div className="grid gap-4 mb-5 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={(event) => onFieldChange('name', event.target.value)}
                        placeholder="e.g., Electronics"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(event) => onFieldChange('slug', event.target.value)}
                        placeholder="electronics"
                        required
                    />
                    <p className="text-xs text-gray-400">Auto-generated from collection name</p>
                </div>
            </div>

            <div className="space-y-2 mb-5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(event) => onFieldChange('description', event.target.value)}
                    placeholder="Describe this collection..."
                    rows={4}
                    className="resize-none"
                />
            </div>

            <div className="space-y-3">
                <Label>Collection Image</Label>

                {imagePreview ? (
                    <div className="relative group overflow-hidden bg-gray-50">
                        <img
                            src={imagePreview}
                            alt="Collection preview"
                            className="w-full aspect-video object-contain p-2"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button
                                type="button"
                                variant="default"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="w-3.5 h-3.5 mr-1" />
                                Replace
                            </Button>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={onClearImage}
                            >
                                <X className="w-3.5 h-3.5 mr-1" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary-800 bg-primary-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImageOff className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500 mb-1">Drop an image or click to upload</p>
                        <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>
        </div>
    );
}
