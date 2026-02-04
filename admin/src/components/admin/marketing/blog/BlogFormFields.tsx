interface BlogFormFieldsProps {
    formData: {
        title: string;
        excerpt: string;
        author: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    errors: Record<string, string>;
}

export function BlogFormFields({ formData, onChange, errors }: BlogFormFieldsProps) {
    return (
        <>
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={onChange}
                    placeholder="e.g., Blog about your latest products or deals"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                />
                {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                </label>
                <p className="text-sm text-gray-500 mb-2">
                    Add a summary of the post to appear on your home page or blog.
                </p>
                <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={onChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                />
            </div>
        </>
    );
}
