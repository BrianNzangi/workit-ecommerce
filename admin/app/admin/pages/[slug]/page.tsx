'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Save,
    ArrowLeft,
    Eye,
    History,
    Globe,
    FileText,
    Monitor,
    Smartphone,
    Search
} from 'lucide-react';
import Link from 'next/link';

const PAGE_TITLES: Record<string, string> = {
    'warranty-refunds': 'Warranty & Refunds',
    'shipping-policy': 'Shipping Policy',
    'terms-of-service': 'Terms Of Service',
    'privacy-policy': 'Privacy Policy',
    'help-center': 'Help Center',
    'returns-claims': 'Returns & Claims',
};

export default function ContentPage() {
    const params = useParams();
    const slug = params.slug as string;
    const title = PAGE_TITLES[slug] || 'Page Editor';

    const [content, setContent] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDesc, setMetaDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href="/admin/dashboard" className="hover:text-primary-600 transition-colors">Admin</Link>
                            <span>/</span>
                            <span>Pages</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium shadow-xs"
                        >
                            {viewMode === 'edit' ? <Eye className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                            {viewMode === 'edit' ? 'Preview' : 'Back to Edit'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-primary-800 text-white rounded-xs hover:bg-primary-900 transition-colors font-medium shadow-xs disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Editor */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xs border border-gray-200 shadow-xs overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Page Content</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <History className="w-3 h-3" />
                                        Last saved: 2 mins ago
                                    </div>
                                </div>
                            </div>

                            <div className="p-0">
                                {viewMode === 'edit' ? (
                                    <div className="min-h-[500px] flex flex-col font-sans">
                                        {/* Simple Formatting Bar Placeholder */}
                                        <div className="flex flex-wrap items-center gap-1 p-2 bg-white border-b border-gray-100">
                                            {['B', 'I', 'U', 'H1', 'H2', 'Link', 'Img', 'List'].map(tool => (
                                                <button key={tool} className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded transition-colors">{tool}</button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Write your content here..."
                                            className="flex-1 w-full p-6 text-gray-700 outline-none resize-none font-sans min-h-[450px]"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 prose prose-slate max-w-none min-h-[500px]">
                                        {content ? (
                                            <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                    <FileText className="w-12 h-12" />
                                                </div>
                                                <p>No content to preview</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEO Settings */}
                        <div className="bg-white rounded-xs border border-gray-200 shadow-xs overflow-hidden">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 flex items-center gap-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">SEO & Meta Data</span>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                                    <input
                                        type="text"
                                        value={metaTitle}
                                        onChange={(e) => setMetaTitle(e.target.value)}
                                        placeholder={`${title} | Workit`}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Optimal length: 50-60 characters</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                                    <textarea
                                        value={metaDesc}
                                        onChange={(e) => setMetaDesc(e.target.value)}
                                        placeholder="Enter a brief summary for search results..."
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">Optimal length: 120-160 characters</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xs border border-gray-200 shadow-xs p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Status & Visibility</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Visibility</span>
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">Public</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Last Updated</span>
                                    <span className="text-sm text-gray-900 font-medium">today, 09:45 PM</span>
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-10 h-5 bg-primary-800 rounded-full relative transition-colors">
                                            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                        <span className="text-sm text-gray-700 group-hover:text-primary-800 transition-colors">Show on Footer</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xs border border-gray-200 shadow-xs p-6">
                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Device Preview</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center justify-center p-4 border-2 border-primary-800 rounded-xs bg-primary-50">
                                    <Monitor className="w-6 h-6 text-primary-800 mb-2" />
                                    <span className="text-xs font-bold text-primary-800">Desktop</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xs hover:bg-gray-50 transition-colors grayscale">
                                    <Smartphone className="w-6 h-6 text-gray-400 mb-2" />
                                    <span className="text-xs font-medium text-gray-500">Mobile</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-primary-900 rounded-xs p-6 text-white overflow-hidden relative">
                            <div className="relative z-10">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Editor Pro-Tip</h3>
                                <p className="text-xs text-primary-200 leading-relaxed">
                                    Use Markdown or HTML to format your content. Your changes are automatically linked to the footer of the store.
                                </p>
                            </div>
                            <Globe className="absolute -bottom-4 -right-4 w-24 h-24 text-primary-800/30" />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
