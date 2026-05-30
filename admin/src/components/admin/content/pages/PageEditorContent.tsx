import { History, FileText } from 'lucide-react';
import { RichTextEditor } from '@/components/admin/shared/RichTextEditor';
import DOMPurify from 'dompurify';

interface PageEditorContentProps {
    content: string;
    onContentChange: (content: string) => void;
    viewMode: 'edit' | 'preview';
    title: string;
    lastSaved: string | null;
}

export function PageEditorContent({
    content,
    onContentChange,
    viewMode,
    title,
    lastSaved,
}: PageEditorContentProps) {
    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">
                    {viewMode === 'edit' ? 'Content' : 'Preview'}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <History className="h-3.5 w-3.5" />
                    {lastSaved ? `Saved ${lastSaved}` : 'Not saved yet'}
                </div>
            </div>

            {viewMode === 'edit' ? (
                <RichTextEditor
                    value={content}
                    onChange={onContentChange}
                    placeholder={`Write your ${title.toLowerCase()} content here...`}
                />
            ) : (
                <div className="rounded-lg bg-gray-50 p-6">
                    {content ? (
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content.replace(/\n/g, '<br/>')) }} />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <div className="mb-3 rounded-full bg-gray-100 p-3">
                                <FileText className="h-8 w-8" />
                            </div>
                            <p className="text-sm">No content to preview</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
