'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/clients/http-client';
import { RichTextEditor } from '@/components/admin/shared/RichTextEditor';
import { PageEditorHeader } from '@/components/admin/content/pages/PageEditorHeader';
import { PageEditorContent } from '@/components/admin/content/pages/PageEditorContent';
import { PageEditorSidebar } from '@/components/admin/content/pages/PageEditorSidebar';

const PAGE_DEFINITIONS: Record<string, { title: string; dbKey: string; description: string }> = {
    'returns-policy': { title: 'Returns Policy', dbKey: 'page_returns_policy', description: 'Customer return eligibility and timeframes' },
    'refunds-policy': { title: 'Refunds Policy', dbKey: 'page_refunds_policy', description: 'Refund processing and eligibility rules' },
    'shipping-policy': { title: 'Shipping Policy', dbKey: 'page_shipping_policy', description: 'Delivery options, costs, and timeframes' },
    'terms-of-service': { title: 'Terms Of Service', dbKey: 'page_terms_of_service', description: 'Legal terms for using the platform' },
    'privacy-policy': { title: 'Privacy Policy', dbKey: 'page_privacy_policy', description: 'Data collection and privacy practices' },
    'advertising-policy': { title: 'Advertising Policy', dbKey: 'page_returns_claims', description: 'Advertising guidelines and disclosures' },
    'help-center': { title: 'Help Center', dbKey: 'page_help_center', description: 'Customer support articles and FAQs' },
    'about-workit': { title: 'About Workit', dbKey: 'page_about_workit', description: 'About the store, mission, and brand story' },
};

export default function PageEditorPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const pageDef = PAGE_DEFINITIONS[slug];

    const [content, setContent] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDesc, setMetaDesc] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const title = pageDef?.title || 'Page Editor';
    const description = pageDef?.description || '';
    const dbKey = pageDef?.dbKey || `page_${slug.replace(/-/g, '_')}`;

    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        try {
            const settings = await httpClient.settings.getAll();
            const pageData = settings[dbKey];

            if (pageData) {
                if (typeof pageData === 'object') {
                    setContent(pageData.content || '');
                    setMetaTitle(pageData.metaTitle || '');
                    setMetaDesc(pageData.metaDesc || '');
                    setLastSaved(pageData.updatedAt ? new Date(pageData.updatedAt).toLocaleTimeString() : null);
                } else {
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
    }, [dbKey]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleContentChange = useCallback((newContent: string) => {
        setContent(newContent);
        setHasChanges(true);
    }, []);

    const handleMetaTitleChange = useCallback((value: string) => {
        setMetaTitle(value);
        setHasChanges(true);
    }, []);

    const handleMetaDescChange = useCallback((value: string) => {
        setMetaDesc(value);
        setHasChanges(true);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const pageData = {
                content,
                metaTitle,
                metaDesc,
                updatedAt: new Date().toISOString(),
            };

            await httpClient.settings.updateAll({
                [dbKey]: pageData,
            });

            setLastSaved(new Date().toLocaleTimeString());
            setHasChanges(false);
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

    if (!pageDef) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="py-12 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
                        <p className="mt-2 text-gray-500">The page &quot;{slug}&quot; does not exist.</p>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (isLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center min-h-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800" />
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <PageEditorHeader
                    title={title}
                    description={description}
                    slug={slug}
                    viewMode={viewMode}
                    onViewModeChange={(mode) => setViewMode(mode)}
                    onSave={handleSave}
                    isSaving={isSaving}
                    hasChanges={hasChanges}
                    onBack={() => router.push('/admin/content/pages')}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <PageEditorContent
                            content={content}
                            onContentChange={handleContentChange}
                            viewMode={viewMode}
                            title={title}
                            lastSaved={lastSaved}
                        />
                    </div>

                    <div>
                        <PageEditorSidebar
                            metaTitle={metaTitle}
                            onMetaTitleChange={handleMetaTitleChange}
                            metaDesc={metaDesc}
                            onMetaDescChange={handleMetaDescChange}
                            lastSaved={lastSaved}
                            title={title}
                        />
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
