import { Search, Clock, Globe, Link as LinkIcon } from 'lucide-react';

interface PageEditorSidebarProps {
    metaTitle: string;
    onMetaTitleChange: (value: string) => void;
    metaDesc: string;
    onMetaDescChange: (value: string) => void;
    lastSaved: string | null;
    title: string;
}

export function PageEditorSidebar({
    metaTitle,
    onMetaTitleChange,
    metaDesc,
    onMetaDescChange,
    lastSaved,
    title,
}: PageEditorSidebarProps) {
    const metaTitleLength = metaTitle.length;
    const metaDescLength = metaDesc.length;
    const metaTitleOk = metaTitleLength <= 60;
    const metaDescOk = metaDescLength <= 160;

    return (
        <div className="space-y-4">
            {/* SEO Section */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">SEO Settings</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                            Meta Title
                            <span className={`text-xs font-normal ${metaTitleOk ? 'text-gray-400' : 'text-red-500'}`}>
                                {metaTitleLength}/60
                            </span>
                        </label>
                        <input
                            type="text"
                            value={metaTitle}
                            onChange={(e) => onMetaTitleChange(e.target.value)}
                            placeholder={`${title} | Workit`}
                            className="w-full rounded-lg bg-gray-50 px-3 py-2.5 text-sm outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                        />
                    </div>

                    <div>
                        <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                            Meta Description
                            <span className={`text-xs font-normal ${metaDescOk ? 'text-gray-400' : 'text-red-500'}`}>
                                {metaDescLength}/160
                            </span>
                        </label>
                        <textarea
                            value={metaDesc}
                            onChange={(e) => onMetaDescChange(e.target.value)}
                            placeholder="Enter a brief summary for search results..."
                            rows={3}
                            className="w-full resize-none rounded-lg bg-gray-50 px-3 py-2.5 text-sm outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                        />
                    </div>
                </div>
            </div>

            {/* Google Preview */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Search Preview</h3>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-base font-medium text-blue-800 truncate">
                        {metaTitle || title}
                    </p>
                    <p className="mt-0.5 text-xs text-green-700 truncate">
                        workit.com
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">
                        {metaDesc || 'No description added yet. Add a meta description to improve search visibility.'}
                    </p>
                </div>
            </div>

            {/* Page Info */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Page Info</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                            Published
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Last Updated</span>
                        <span className="text-sm font-medium text-gray-900">{lastSaved || 'Never'}</span>
                    </div>

                    <div className="pt-2">
                        <span className="mb-1.5 block text-sm text-gray-500">URL Slug</span>
                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                            <LinkIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            <span className="truncate text-sm font-mono text-gray-600">
                                /{title.toLowerCase().replace(/\s+/g, '-')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Tip */}
            <div className="rounded-xl bg-primary-900 p-5 text-white">
                <div className="mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-primary-300">SEO Tip</h3>
                </div>
                <p className="text-sm leading-relaxed text-primary-200">
                    Keep meta titles under 60 characters and descriptions under 160 for optimal Google display.
                </p>
            </div>
        </div>
    );
}
