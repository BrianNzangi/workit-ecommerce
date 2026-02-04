import { Upload } from 'lucide-react';
import { BlogSEOSection } from './BlogSEOSection';

interface BlogSidebarProps {
    featuredImage: string | null;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onImageRemove: () => void;
    author: string;
    onAuthorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadingImage: boolean;
    metaTitle: string;
    metaDescription: string;
    onMetaChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    formData: {
        title: string;
        excerpt: string;
    };
}

export function BlogSidebar({
    featuredImage,
    onImageUpload,
    onImageRemove,
    author,
    onAuthorChange,
    uploadingImage,
    metaTitle,
    metaDescription,
    onMetaChange,
    formData,
}: BlogSidebarProps) {
    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    return (
        <div className="space-y-6">
            {/* Featured Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Featured Image</h3>
                {featuredImage ? (
                    <div className="relative">
                        <img
                            src={featuredImage}
                            alt="Featured"
                            className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                            onClick={onImageRemove}
                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={onImageUpload}
                            className="hidden"
                            id="image-upload"
                            disabled={uploadingImage}
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 font-medium">
                                {uploadingImage ? 'Uploading...' : 'Add image'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                or drop an image to upload
                            </p>
                        </label>
                    </div>
                )}
            </div>

            {/* Author */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Author</h3>
                <input
                    type="text"
                    name="author"
                    value={author}
                    onChange={onAuthorChange}
                    placeholder="Author name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
            </div>

            {/* SEO Section */}
            <BlogSEOSection
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                onChange={onMetaChange}
                previewTitle={formData.title}
                previewSlug={generateSlug(formData.title)}
                previewDescription={formData.excerpt}
            />
        </div>
    );
}
