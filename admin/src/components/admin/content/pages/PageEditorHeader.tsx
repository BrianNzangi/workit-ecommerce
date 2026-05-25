import Link from 'next/link';
import { ArrowLeft, Save, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageEditorHeaderProps {
    title: string;
    description: string;
    slug: string;
    viewMode: 'edit' | 'preview';
    onViewModeChange: (mode: 'edit' | 'preview') => void;
    onSave: () => void;
    isSaving: boolean;
    hasChanges: boolean;
    onBack: () => void;
}

export function PageEditorHeader({
    title,
    description,
    slug,
    viewMode,
    onViewModeChange,
    onSave,
    isSaving,
    hasChanges,
    onBack,
}: PageEditorHeaderProps) {
    return (
        <div className="mb-8">
            <nav className="mb-4 flex items-center gap-2 text-sm">
                <Link href="/admin/content/pages" className="text-gray-400 hover:text-gray-900 transition-colors">
                    Pages
                </Link>
                <span className="text-gray-300">/</span>
                <span className="text-gray-900 font-medium">{title}</span>
            </nav>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>

                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Unsaved changes
                        </span>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewModeChange(viewMode === 'edit' ? 'preview' : 'edit')}
                        className="gap-1.5 border-gray-200 bg-white shadow-none hover:bg-gray-50"
                    >
                        {viewMode === 'edit' ? <Eye className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        {viewMode === 'edit' ? 'Preview' : 'Edit'}
                    </Button>

                    <Button
                        size="sm"
                        onClick={onSave}
                        disabled={isSaving || !hasChanges}
                        className="gap-1.5 bg-primary-900 text-white hover:bg-primary-800 shadow-none"
                    >
                        {isSaving ? (
                            <CheckCircle2 className="h-4 w-4 animate-pulse" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
