'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Undo, Redo, Image as ImageIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none px-0 py-2',
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            editor.chain().focus().insertContent(`<img src="${reader.result}" alt="${file.name}" class="max-w-full h-auto rounded-md" />`).run();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const btnBase = "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors";
    const btnActive = "bg-primary-50 text-primary-700";
    const btnInactive = "text-gray-400 hover:bg-gray-100 hover:text-gray-600";
    const btnDisabled = "opacity-40 cursor-not-allowed";
    const divider = "w-px h-6 bg-gray-200 mx-1";

    const toolbarBtn = (active: boolean, disabled?: boolean) =>
        `${btnBase} ${active ? btnActive : btnInactive} ${disabled ? btnDisabled : ''}`;

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
            />
            <div className="flex flex-wrap gap-1 items-center pb-3">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={toolbarBtn(editor.isActive('bold'))}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={toolbarBtn(editor.isActive('italic'))}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <div className={divider} />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={toolbarBtn(editor.isActive('heading', { level: 2 }))}
                    title="Heading"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={toolbarBtn(editor.isActive('bulletList'))}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={toolbarBtn(editor.isActive('orderedList'))}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={toolbarBtn(editor.isActive('blockquote'))}
                    title="Quote"
                >
                    <Quote className="h-4 w-4" />
                </button>
                <div className={divider} />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={toolbarBtn(false)}
                    title="Insert Image"
                >
                    <ImageIcon className="h-4 w-4" />
                </button>
                <div className={divider} />
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className={toolbarBtn(false, !editor.can().undo())}
                    title="Undo"
                >
                    <Undo className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className={toolbarBtn(false, !editor.can().redo())}
                    title="Redo"
                >
                    <Redo className="h-4 w-4" />
                </button>
            </div>

            <div className="border-t border-gray-100 pt-3">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
