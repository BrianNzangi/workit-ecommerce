interface BlogSEOSectionProps {
    metaTitle: string;
    metaDescription: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    previewTitle: string;
    previewSlug: string;
    previewDescription: string;
}

export function BlogSEOSection({
    metaTitle,
    metaDescription,
    onChange,
    previewTitle,
    previewSlug,
    previewDescription,
}: BlogSEOSectionProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">
                    Search engine listing
                </h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
                Add a title and description to see how this blog post might appear in a
                search engine listing
            </p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Title
                    </label>
                    <input
                        type="text"
                        name="metaTitle"
                        value={metaTitle}
                        onChange={onChange}
                        placeholder={previewTitle || 'Blog post title'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        maxLength={60}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {metaTitle.length}/60 characters
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Meta Description
                    </label>
                    <textarea
                        name="metaDescription"
                        value={metaDescription}
                        onChange={onChange}
                        placeholder={previewDescription || 'Brief description of your blog post'}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        maxLength={160}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {metaDescription.length}/160 characters
                    </p>
                </div>
                {/* Preview */}
                {(metaTitle || previewTitle) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <h4 className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                            {metaTitle || previewTitle}
                        </h4>
                        <p className="text-green-700 text-sm mt-1">
                            workit.co.ke › blog › {previewSlug}
                        </p>
                        <p className="text-gray-600 text-sm mt-1">
                            {metaDescription || previewDescription || 'No description available'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
