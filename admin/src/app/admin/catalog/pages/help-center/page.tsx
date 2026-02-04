'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Save,
    ArrowLeft,
    FileText,
    HelpCircle,
    ChevronRight,
    Search as SearchIcon,
    History,
    Eye,
    CheckCircle,
    X
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { httpClient } from '@/lib/clients/http-client';
import { RichTextEditor } from '@/components/admin/RichTextEditor';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    lastUpdated: string;
}

const CATEGORIES = [
    'General',
    'Orders',
    'Payments',
    'Returns',
    'Shipping',
    'Account',
    'Technical'
];

export default function HelpCenterPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const settingKey = 'page_help_center';

    useEffect(() => {
        fetchHelpCenterData();
    }, []);

    const fetchHelpCenterData = async () => {
        setIsLoading(true);
        try {
            const settings = await httpClient.settings.getAll();
            const helpData = settings[settingKey];

            if (helpData && Array.isArray(helpData.articles)) {
                setArticles(helpData.articles);
            } else if (typeof helpData === 'string') {
                // Migrate from legacy string if it exists
                setArticles([{
                    id: uuidv4(),
                    title: 'General Help',
                    content: helpData,
                    category: 'General',
                    lastUpdated: new Date().toISOString()
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
    };

    const saveHelpCenterData = async (updatedArticles: Article[]) => {
        setIsSaving(true);
        try {
            await httpClient.settings.updateAll({
                [settingKey]: {
                    articles: updatedArticles,
                    updatedAt: new Date().toISOString()
                }
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
        const newArticle: Article = {
            id: uuidv4(),
            title: '',
            content: '',
            category: 'General',
            lastUpdated: new Date().toISOString()
        };
        setEditingArticle(newArticle);
        setIsEditing(true);
    };

    const handleEditArticle = (article: Article) => {
        setEditingArticle({ ...article });
        setIsEditing(true);
    };

    const handleDeleteArticle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        const updatedArticles = articles.filter(a => a.id !== id);
        setArticles(updatedArticles);
        await saveHelpCenterData(updatedArticles);
    };

    const handleSaveArticle = async () => {
        if (!editingArticle) return;
        if (!editingArticle.title.trim()) {
            toast({ title: 'Error', description: 'Article title is required', variant: 'error' });
            return;
        }

        const newArticle = {
            ...editingArticle,
            lastUpdated: new Date().toISOString()
        };

        let updatedArticles;
        const exists = articles.find(a => a.id === newArticle.id);

        if (exists) {
            updatedArticles = articles.map(a => a.id === newArticle.id ? newArticle : a);
        } else {
            updatedArticles = [newArticle, ...articles];
        }

        setArticles(updatedArticles);
        await saveHelpCenterData(updatedArticles);
        setIsEditing(false);
        setEditingArticle(null);
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                </div>
            </AdminLayout>
        );
    }

    if (isEditing && editingArticle) {
        return (
            <AdminLayout>
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => { setIsEditing(false); setEditingArticle(null); }}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Back to Articles</span>
                    </button>

                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">
                            {editingArticle.title ? 'Edit Article' : 'New Article'}
                        </h1>
                        <button
                            onClick={handleSaveArticle}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-primary-800 text-white rounded-xs hover:bg-primary-900 transition-colors font-medium shadow-xs disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? 'Saving...' : 'Save Article'}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xs border border-gray-200 shadow-xs space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Article Title</label>
                                    <input
                                        type="text"
                                        value={editingArticle.title}
                                        onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                                        placeholder="e.g., How to tracking my order"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select
                                        value={editingArticle.category}
                                        onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                                <RichTextEditor
                                    value={editingArticle.content}
                                    onChange={(val) => setEditingArticle({ ...editingArticle, content: val })}
                                    placeholder="Write the full article content here..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                            <Link href="/admin/dashboard" className="hover:text-primary-600 transition-colors text-xs uppercase font-bold tracking-widest">Admin</Link>
                            <span>/</span>
                            <span className="text-xs uppercase font-bold tracking-widest">Catalog</span>
                            <span>/</span>
                            <span className="text-xs uppercase font-bold tracking-widest text-primary-800">Help Center</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Help Center Management</h1>
                        <p className="text-gray-500 mt-1">Manage multiple listed articles for the customer help center.</p>
                    </div>

                    <button
                        onClick={handleAddArticle}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-800 text-white rounded-xs hover:bg-primary-900 transition-colors font-medium shadow-xs"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Article</span>
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xs border border-gray-200 shadow-xs mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                        {['All', ...CATEGORIES].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat
                                    ? 'bg-primary-800 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Article List */}
                <div className="bg-white rounded-xs border border-gray-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest">Article</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest text-center">Category</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest">Last Updated</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredArticles.length > 0 ? (
                                    filteredArticles.map(article => (
                                        <tr key={article.id} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary-50 rounded-xs flex items-center justify-center text-primary-800 shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-primary-800 transition-colors line-clamp-1">{article.title}</h4>
                                                        <p className="text-xs text-gray-400 line-clamp-1">{article.content.substring(0, 100)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded leading-none">
                                                    {article.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(article.lastUpdated).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditArticle(article)}
                                                        className="p-2 text-gray-400 hover:text-primary-800 hover:bg-primary-50 rounded transition-all"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteArticle(article.id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="bg-gray-50 p-6 rounded-full mb-4">
                                                    <HelpCircle className="w-16 h-16 opacity-20" />
                                                </div>
                                                <p className="text-lg font-medium">No articles found</p>
                                                <p className="text-sm">Try adjusting your filters or search term</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <History className="w-3 h-3" />
                            <span>Last saved: {lastSaved || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Edit2 className="w-3 h-3" />
                            <span>{articles.length} Total Articles</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                            <CheckCircle className="w-3 h-3" />
                            ONLINE
                        </span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
