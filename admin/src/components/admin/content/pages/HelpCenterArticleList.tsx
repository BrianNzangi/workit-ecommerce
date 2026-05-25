import { Search, FileText, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    lastUpdated: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
    General: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-200' },
    Orders: { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200' },
    Payments: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
    Returns: { bg: 'bg-orange-50', text: 'text-orange-700', ring: 'ring-orange-200' },
    Shipping: { bg: 'bg-purple-50', text: 'text-purple-700', ring: 'ring-purple-200' },
    Account: { bg: 'bg-pink-50', text: 'text-pink-700', ring: 'ring-pink-200' },
    Technical: { bg: 'bg-cyan-50', text: 'text-cyan-700', ring: 'ring-cyan-200' },
};

interface HelpCenterArticleListProps {
    articles: Article[];
    allArticlesCount: number;
    categoryCounts: Record<string, number>;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
    onEdit: (article: Article) => void;
    onDelete: (id: string, title: string) => void;
}

export function HelpCenterArticleList({
    articles,
    allArticlesCount,
    categoryCounts,
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories,
    onEdit,
    onDelete,
}: HelpCenterArticleListProps) {
    const isFiltered = searchTerm.trim().length > 0 && articles.length !== allArticlesCount;

    return (
        <div className="space-y-5">
            {/* Search & Category Filters */}
            <div className="rounded-xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="rounded-lg bg-gray-50 pl-9 ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => onCategoryChange('All')}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                selectedCategory === 'All'
                                    ? 'bg-primary-900 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            All
                            <span className="ml-1.5 opacity-70">({allArticlesCount})</span>
                        </button>
                        {categories.map((cat) => {
                            const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.General;
                            const count = categoryCounts[cat] || 0;
                            if (count === 0 && selectedCategory !== cat) return null;

                            return (
                                <button
                                    key={cat}
                                    onClick={() => onCategoryChange(cat)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                                        selectedCategory === cat
                                            ? `${colors.bg} ${colors.text} ring-1 ${colors.ring}`
                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                    <span className="ml-1.5 opacity-70">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Article List */}
            <div className="rounded-xl bg-white shadow-sm">
                {articles.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                            <HelpCircle className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                            {isFiltered ? 'No articles match your filters' : 'No articles yet'}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                            {isFiltered ? 'Try adjusting your search or category filter' : 'Click "Add Article" to create your first article'}
                        </p>
                    </div>
                ) : (
                    <div>
                        <div className="px-5 py-3">
                            <div className="flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                <span className="flex-1">Article</span>
                                <span className="w-24 text-center">Category</span>
                                <span className="w-28">Updated</span>
                                <span className="w-20 text-right">Actions</span>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {articles.map((article) => {
                                const colors = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.General;

                                return (
                                    <div key={article.id} className="group px-5 py-4 transition-colors hover:bg-gray-50/50">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-1 items-center gap-3">
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colors.bg} ${colors.text}`}>
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-900 group-hover:text-primary-900">
                                                        {article.title}
                                                    </p>
                                                    <p className="truncate text-xs text-gray-400">
                                                        {article.content.replace(/<[^>]*>/g, '').substring(0, 80)}...
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="flex w-24 justify-center">
                                                <Badge
                                                    variant="outline"
                                                    className={`rounded-full border-0 px-2.5 py-0.5 text-[10px] font-semibold ${colors.bg} ${colors.text}`}
                                                >
                                                    {article.category}
                                                </Badge>
                                            </span>

                                            <span className="w-28 text-sm text-gray-400">
                                                {new Date(article.lastUpdated).toLocaleDateString()}
                                            </span>

                                            <div className="flex w-20 items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit(article)}
                                                    className="h-8 w-8 text-gray-400 hover:text-primary-900 hover:bg-primary-50"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete(article.id, article.title)}
                                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
