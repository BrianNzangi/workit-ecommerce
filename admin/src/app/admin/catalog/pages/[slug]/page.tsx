'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Save,
    Eye,
    History,
    FileText,
    Monitor,
    Smartphone,
    Search,
    Globe,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/clients/http-client';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

const PAGE_TITLES: Record<string, string> = {
    'warranty-refunds': 'Warranty & Refunds',
    'shipping-policy': 'Shipping Policy',
    'terms-of-service': 'Terms Of Service',
    'privacy-policy': 'Privacy Policy',
    'returns-claims': 'Returns & Claims',
};

export default function ContentPage() {
    const params = useParams();
    const slug = params.slug as string;
    const title = PAGE_TITLES[slug] || 'Page Editor';
    const settingKey = `page_${slug.replace(/-/g, '_')}`;

    const [content, setContent] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDesc, setMetaDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [lastSaved, setLastSaved] = useState<string | null>(null);

    useEffect(() => {
        fetchPageData();
    }, [slug]);

    const fetchPageData = async () => {
        setIsLoading(true);
        try {
            const settings = await httpClient.settings.getAll();
            const pageData = settings[settingKey];

            if (pageData) {
                if (typeof pageData === 'object') {
                    setContent(pageData.content || '');
                    setMetaTitle(pageData.metaTitle || '');
                    setMetaDesc(pageData.metaDesc || '');
                } else {
                    // Legacy support if it was just a string
                    setContent(pageData);
                }
            }
        } catch (error) {
            console.error('Error fetching page data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load page content',
                variant: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const pageData = {
                content,
                metaTitle,
                metaDesc,
                updatedAt: new Date().toISOString()
            };

            await httpClient.settings.updateAll({
                [settingKey]: pageData
            });

            setLastSaved(new Date().toLocaleTimeString());
            toast({
                title: 'Success',
                description: `${title} saved successfully`,
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving page:', error);
            toast({
                title: 'Save failed',
                description: 'Could not save page content',
                variant: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                {/* Breadcrumbs & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href="/admin/dashboard" className="hover:text-primary-600 transition-colors text-xs uppercase font-bold tracking-widest">Admin</Link>
                            <span>/</span>
                            <span className="text-xs uppercase font-bold tracking-widest">Catalog</span>
                            <span>/</span>
                            <span className="text-xs uppercase font-bold tracking-widest text-primary-800">Pages</span>
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
                                        {lastSaved ? `Last saved: ${lastSaved}` : 'No changes saved yet'}
                                    </div>
                                </div>
                            </div>

                            <div className="p-0">
                                {viewMode === 'edit' ? (
                                    <div className="min-h-[500px] flex flex-col font-sans">
                                        <RichTextEditor
                                            value={content}
                                            onChange={setContent}
                                            placeholder="Write your policy content here..."
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
                                    <span className="text-sm text-gray-900 font-medium">{lastSaved || 'N/A'}</span>
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

                        <div className="bg-primary-900 rounded-xs p-6 text-white overflow-hidden relative shadow-lg">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe className="w-5 h-5 text-primary-500" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest italic">SEO Pro-Tip</h3>
                                </div>
                                <p className="text-xs text-primary-200 leading-relaxed font-medium">
                                    Keep your meta titles under 60 characters to ensure they look great on Google Search results.
                                </p>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-800/20 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
