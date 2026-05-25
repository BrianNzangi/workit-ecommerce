'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { toast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/clients/http-client';
import { HelpCenterHeader } from '@/components/admin/content/pages/HelpCenterHeader';
import { HelpCenterArticleList } from '@/components/admin/content/pages/HelpCenterArticleList';
import { HelpCenterArticleEditor } from '@/components/admin/content/pages/HelpCenterArticleEditor';
import { HelpCenterDeleteDialog } from '@/components/admin/content/pages/HelpCenterDeleteDialog';
import { HelpCenterLoadingState } from '@/components/admin/content/pages/HelpCenterLoadingState';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    lastUpdated: string;
}

function createArticleId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `article-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const CATEGORIES = ['General', 'Orders', 'Payments', 'Returns', 'Shipping', 'Account', 'Technical'];
const SETTING_KEY = 'page_help_center';

export default function HelpCenterPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [isEditing, setIsEditing] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<{ id: string; title: string } | null>(null);

    const fetchHelpCenterData = useCallback(async () => {
        setIsLoading(true);
        try {
            const settings = await httpClient.settings.getAll();
            const helpData = settings[SETTING_KEY];

            if (helpData && Array.isArray(helpData.articles)) {
                setArticles(helpData.articles);
                setLastSaved(helpData.updatedAt ? new Date(helpData.updatedAt).toLocaleTimeString() : null);
            } else if (typeof helpData === 'string') {
                setArticles([{
                    id: createArticleId(),
                    title: 'General Help',
                    content: helpData,
                    category: 'General',
                    lastUpdated: new Date().toISOString(),
                }]);
            }
        } catch (error) {
            console.error('Error fetching help center data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load help center content',
                variant: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHelpCenterData();
    }, [fetchHelpCenterData]);

    const saveHelpCenterData = async (updatedArticles: Article[]) => {
        setIsSaving(true);
        try {
            await httpClient.settings.updateAll({
                [SETTING_KEY]: {
                    articles: updatedArticles,
                    updatedAt: new Date().toISOString(),
                },
            });
            setLastSaved(new Date().toLocaleTimeString());
            toast({
                title: 'Success',
                description: 'Help Center updated successfully',
                variant: 'success',
            });
        } catch (error) {
            console.error('Error saving help center:', error);
            toast({
                title: 'Save failed',
                description: 'Could not save help center changes',
                variant: 'error',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddArticle = () => {
        setEditingArticle({
            id: createArticleId(),
            title: '',
            content: '',
            category: 'General',
            lastUpdated: new Date().toISOString(),
        });
        setIsEditing(true);
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticle({ ...article });
        setIsEditing(true);
    };

    const openDeleteDialog = (id: string, title: string) => {
        setArticleToDelete({ id, title });
        setDeleteDialogOpen(true);
    };

    const handleDeleteArticle = async () => {
        if (!articleToDelete) return;
        const updatedArticles = articles.filter((a) => a.id !== articleToDelete.id);
        setArticles(updatedArticles);
        await saveHelpCenterData(updatedArticles);
        setDeleteDialogOpen(false);
        setArticleToDelete(null);
    };

    const handleSaveArticle = async () => {
        if (!editingArticle) return;
        if (!editingArticle.title.trim()) {
            toast({ title: 'Error', description: 'Article title is required', variant: 'error' });
            return;
        }

        const newArticle = {
            ...editingArticle,
            lastUpdated: new Date().toISOString(),
        };

        const exists = articles.find((a) => a.id === newArticle.id);
        const updatedArticles = exists
            ? articles.map((a) => (a.id === newArticle.id ? newArticle : a))
            : [newArticle, ...articles];

        setArticles(updatedArticles);
        await saveHelpCenterData(updatedArticles);
        setIsEditing(false);
        setEditingArticle(null);
    };

    const filteredArticles = articles.filter((article) => {
        const matchesSearch =
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryCounts = CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
        acc[cat] = articles.filter((a) => a.category === cat).length;
        return acc;
    }, {});

    if (isLoading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="mx-auto max-w-4xl">
                        <HelpCenterLoadingState />
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    if (isEditing && editingArticle) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="mx-auto max-w-4xl">
                        <HelpCenterArticleEditor
                            article={editingArticle}
                            onArticleChange={setEditingArticle}
                            onSave={handleSaveArticle}
                            onCancel={() => {
                                setIsEditing(false);
                                setEditingArticle(null);
                            }}
                            isSaving={isSaving}
                            categories={CATEGORIES}
                        />
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mx-auto max-w-4xl">
                    <HelpCenterHeader
                        onAddArticle={handleAddArticle}
                        articleCount={articles.length}
                        lastSaved={lastSaved}
                    />

                    <HelpCenterArticleList
                        articles={filteredArticles}
                        allArticlesCount={articles.length}
                        categoryCounts={categoryCounts}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        categories={CATEGORIES}
                        onEdit={handleEditArticle}
                        onDelete={openDeleteDialog}
                    />

                    <HelpCenterDeleteDialog
                        open={deleteDialogOpen}
                        loading={isSaving}
                        articleTitle={articleToDelete?.title}
                        onOpenChange={(open) => {
                            if (!open) {
                                setDeleteDialogOpen(false);
                                setArticleToDelete(null);
                            }
                        }}
                        onConfirm={handleDeleteArticle}
                    />
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
