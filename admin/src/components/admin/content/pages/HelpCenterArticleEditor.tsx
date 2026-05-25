import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/admin/shared/RichTextEditor';

interface Article {
    id: string;
    title: string;
    content: string;
    category: string;
    lastUpdated: string;
}

interface HelpCenterArticleEditorProps {
    article: Article;
    onArticleChange: (article: Article) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    categories: string[];
}

export function HelpCenterArticleEditor({
    article,
    onArticleChange,
    onSave,
    onCancel,
    isSaving,
    categories,
}: HelpCenterArticleEditorProps) {
    return (
        <div className="max-w-4xl">
            <div className="mb-8">
                <button
                    onClick={onCancel}
                    className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Articles
                </button>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        {article.title ? 'Edit Article' : 'New Article'}
                    </h1>
                    <Button
                        onClick={onSave}
                        disabled={isSaving}
                        className="gap-2 bg-primary-900 text-white hover:bg-primary-800 shadow-none"
                    >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Saving...' : 'Save Article'}
                    </Button>
                </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Article Title</label>
                    <input
                        type="text"
                        value={article.title}
                        onChange={(e) => onArticleChange({ ...article, title: e.target.value })}
                        placeholder="e.g., How to track my order"
                        className="w-full rounded-lg bg-gray-50 px-3 py-2.5 text-sm outline-none ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                    <Select
                        value={article.category}
                        onValueChange={(value) => onArticleChange({ ...article, category: value })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Content</label>
                    <RichTextEditor
                        value={article.content}
                        onChange={(val) => onArticleChange({ ...article, content: val })}
                        placeholder="Write the full article content here..."
                    />
                </div>
            </div>
        </div>
    );
}
