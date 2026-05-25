import { Editor, EditorContent } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface BlogEditorProps {
    editor: Editor | null;
    error?: string;
}

export function BlogEditor({ editor, error }: BlogEditorProps) {
    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url && editor) {
            editor.chain().focus().insertContent(`<img src="${url}" alt="Image" class="max-w-full h-auto rounded-sm" />`).run();
        }
    };

    return (
        <Card className="rounded-sm shadow-xs">
            <CardContent className="p-5">
                <Label className="text-sm font-medium mb-2 block">Content</Label>
                {/* Editor Toolbar */}
                <div className="bg-muted rounded-t-sm p-2 flex items-center gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={`p-2 rounded-sm hover:bg-accent ${editor?.isActive('bold') ? 'bg-accent' : ''}`}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={`p-2 rounded-sm hover:bg-accent ${editor?.isActive('italic') ? 'bg-accent' : ''}`}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-border"></div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={`p-2 rounded-sm hover:bg-accent ${editor?.isActive('bulletList') ? 'bg-accent' : ''}`}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={`p-2 rounded-sm hover:bg-accent ${editor?.isActive('orderedList') ? 'bg-accent' : ''}`}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </button>
                    <div className="w-px h-6 bg-border"></div>
                    <button
                        type="button"
                        onClick={addLink}
                        className="p-2 rounded-sm hover:bg-accent"
                        title="Add Link"
                    >
                        <Link2 className="w-4 h-4" />
                    </button>
                    <button
                        type="button"
                        onClick={addImage}
                        className="p-2 rounded-sm hover:bg-accent"
                        title="Add Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </button>
                </div>
                <div className={`bg-background rounded-b-sm ${error ? '' : ''}`}>
                    <EditorContent editor={editor} />
                </div>
                {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
            </CardContent>
        </Card>
    );
}
