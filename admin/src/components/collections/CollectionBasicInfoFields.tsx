'use client';

import { X } from 'lucide-react';

interface CollectionBasicInfoFieldsProps {
    formData: {
        name: string;
        slug: string;
        description: string;
    };
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    imagePreview: string;
    setImageFile: (file: File | null) => void;
    setImagePreview: (preview: string) => void;
    handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CollectionBasicInfoFields({
    formData,
    handleChange,
    imagePreview,
    setImageFile,
    setImagePreview,
    handleImageChange
}: CollectionBasicInfoFieldsProps) {
    return (
        <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Collection Information</h2>

            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Collection Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                        placeholder="e.g., Electronics"
                    />
                </div>

                <div>
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug *
                    </label>
                    <input
                        type="text"
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                        placeholder="electronics"
                    />
                    <p className="mt-1 text-xs text-gray-500">Auto-generated from collection name</p>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                        placeholder="Enter collection description..."
                    />
                </div>

                <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                        Collection Image
                    </label>
                    <div className="space-y-3">
                        {imagePreview && (
                            <div className="relative w-full h-48 border border-gray-300 rounded-xs overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Collection preview"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImageFile(null);
                                        setImagePreview('');
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xs hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500">
                            Upload an image for this collection (optional)
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
