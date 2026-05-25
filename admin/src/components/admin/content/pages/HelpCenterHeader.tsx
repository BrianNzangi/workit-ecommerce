import { Plus, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpCenterHeaderProps {
    onAddArticle: () => void;
    articleCount: number;
    lastSaved: string | null;
}

export function HelpCenterHeader({ onAddArticle, articleCount, lastSaved }: HelpCenterHeaderProps) {
    return (
        <div className="mb-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Help Center</h1>
                            <p className="text-sm text-gray-500">
                                Manage help articles for your customers
                            </p>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onAddArticle}
                    className="gap-2 bg-primary-900 text-white hover:bg-primary-800 shadow-none"
                >
                    <Plus className="h-4 w-4" />
                    Add Article
                </Button>
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Last saved: {lastSaved || 'N/A'}</span>
                </div>
                <span className="text-gray-200">|</span>
                <span>{articleCount} article{articleCount !== 1 ? 's' : ''}</span>
            </div>
        </div>
    );
}
