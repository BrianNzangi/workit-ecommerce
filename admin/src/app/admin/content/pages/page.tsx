'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/clients/http-client';
import {
    Page,
    PagesHeader,
    PagesStats,
    PagesToolbar,
    PagesLoadingState,
    PagesEmptyState,
    PagesTable,
} from '@/components/admin/content/pages';

const PAGE_DEFINITIONS: { slug: string; title: string; dbKey: string; description: string }[] = [
    { slug: 'returns-policy', title: 'Returns Policy', dbKey: 'page_returns_policy', description: 'Customer return eligibility and timeframes' },
    { slug: 'refunds-policy', title: 'Refunds Policy', dbKey: 'page_refunds_policy', description: 'Refund processing and eligibility rules' },
    { slug: 'shipping-policy', title: 'Shipping Policy', dbKey: 'page_shipping_policy', description: 'Delivery options, costs, and timeframes' },
    { slug: 'terms-of-service', title: 'Terms Of Service', dbKey: 'page_terms_of_service', description: 'Legal terms for using the platform' },
    { slug: 'privacy-policy', title: 'Privacy Policy', dbKey: 'page_privacy_policy', description: 'Data collection and privacy practices' },
    { slug: 'advertising-policy', title: 'Advertising Policy', dbKey: 'page_returns_claims', description: 'Advertising guidelines and disclosures' },
    { slug: 'help-center', title: 'Help Center', dbKey: 'page_help_center', description: 'Customer support articles and FAQs' },
];

export default function PagesPage() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchPages = useCallback(async () => {
        try {
            setLoading(true);
            const settings = await httpClient.settings.getAll();
            const fetchedPages: Page[] = PAGE_DEFINITIONS.map((def) => {
                const data = settings[def.dbKey];
                let content = '';
                let updatedAt = '';
                let articleCount = 0;

                if (data) {
                    if (typeof data === 'object') {
                        content = data.content || '';
                        updatedAt = data.updatedAt || '';
                        if (Array.isArray(data.articles)) {
                            articleCount = data.articles.length;
                        }
                    } else {
                        content = data;
                    }
                }

                return {
                    slug: def.slug,
                    title: def.title,
                    dbKey: def.dbKey,
                    content,
                    updatedAt,
                    articleCount,
                    hasContent: content.length > 0,
                    description: def.description,
                };
            });
            setPages(fetchedPages);
        } catch (error) {
            console.error('Error fetching pages:', error);
            toast({
                title: 'Error',
                description: 'Failed to load pages',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPages();
    }, [fetchPages]);

    const filteredPages = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return pages;
        return pages.filter(
            (page) =>
                page.title.toLowerCase().includes(normalizedSearch) ||
                page.slug.toLowerCase().includes(normalizedSearch) ||
                page.description.toLowerCase().includes(normalizedSearch)
        );
    }, [pages, searchTerm]);

    const showStats = !loading && pages.length > 0;
    const showEmpty = !loading && pages.length === 0;
    const showNoResults = !loading && pages.length > 0 && filteredPages.length === 0;

    return (
        <ProtectedRoute>
            <AdminLayout>
                <PagesHeader />

                {showStats && <PagesStats pages={pages} />}

                {loading ? (
                    <PagesLoadingState />
                ) : showEmpty ? (
                    <PagesEmptyState />
                ) : (
                    <>
                        <PagesToolbar
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            totalCount={pages.length}
                            filteredCount={filteredPages.length}
                        />

                        {showNoResults ? (
                            <PagesEmptyState searchTerm={searchTerm} />
                        ) : (
                            <PagesTable pages={filteredPages} />
                        )}
                    </>
                )}
            </AdminLayout>
        </ProtectedRoute>
    );
}
