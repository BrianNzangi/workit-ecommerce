import { Editor, EditorContent } from '@tiptap/react';
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon } from 'lucide-react';

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
            editor.chain().focus().insertContent(`<img src="${url}" alt="Image" class="max-w-full h-auto rounded-lg" />`).run();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
            </label>

            {/* Editor Toolbar */}
            <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex items-center gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-300' : ''
                        }`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-300' : ''
                        }`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''
                        }`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-gray-300' : ''
                        }`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                    type="button"
                    onClick={addLink}
                    className="p-2 rounded hover:bg-gray-200"
                    title="Add Link"
                >
                    <Link2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={addImage}
                    className="p-2 rounded hover:bg-gray-200"
                    title="Add Image"
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Content */}
            <div
                className={`border border-t-0 border-gray-300 rounded-b-lg bg-white ${error ? 'border-red-500' : ''
                    }`}
            >
                <EditorContent editor={editor} />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}
