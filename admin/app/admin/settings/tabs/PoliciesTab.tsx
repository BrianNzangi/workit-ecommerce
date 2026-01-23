'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, Bold, Italic, List, ListOrdered, Link2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import { Settings } from './index';

interface PoliciesTabProps {
    settings: Settings;
    setSettings: (settings: Settings) => void;
    readOnly?: boolean;
}

interface PolicyEditorProps {
    title: string;
    value: string;
    onChange: (value: string) => void;
    badge?: string;
    badgeColor?: string;
    readOnly?: boolean;
}

function PolicyEditor({ title, value, onChange, badge, badgeColor = 'gray', readOnly = false }: PolicyEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
            }),
            TiptapLink.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
        ],
        content: value || '<p>Enter your policy here...</p>',
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            if (!readOnly) {
                onChange(editor.getHTML());
            }
        },
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[200px] px-4 py-3',
            },
        },
        immediatelyRender: false,
    });

    // Update editor content when value changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '<p>Enter your policy here...</p>');
        }
    }, [value, editor]);

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const badgeColors = {
        gray: 'bg-gray-100 text-gray-600',
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
    };

    return (
        <div className="border border-gray-200 rounded-xs shadow-xs p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                {badge && (
                    <span className={`text-xs px-2 py-1 rounded ${badgeColors[badgeColor as keyof typeof badgeColors] || badgeColors.gray}`}>
                        {badge}
                    </span>
                )}
            </div>

            {/* Editor Toolbar */}
            <div className={`border border-gray-300 rounded-t-xs bg-gray-50 p-2 flex items-center gap-2 flex-wrap mb-0 ${readOnly ? 'opacity-50' : ''}`}>
                <button
                    type="button"
                    onClick={() => !readOnly && editor?.chain().focus().toggleBold().run()}
                    disabled={readOnly}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-300' : ''} disabled:cursor-not-allowed`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => !readOnly && editor?.chain().focus().toggleItalic().run()}
                    disabled={readOnly}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-300' : ''} disabled:cursor-not-allowed`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                    type="button"
                    onClick={() => !readOnly && editor?.chain().focus().toggleBulletList().run()}
                    disabled={readOnly}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''} disabled:cursor-not-allowed`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => !readOnly && editor?.chain().focus().toggleOrderedList().run()}
                    disabled={readOnly}
                    className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('orderedList') ? 'bg-gray-300' : ''} disabled:cursor-not-allowed`}
                    title="Numbered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                    type="button"
                    onClick={() => !readOnly && addLink()}
                    disabled={readOnly}
                    className="p-2 rounded hover:bg-gray-200 disabled:cursor-not-allowed"
                    title="Add Link"
                >
                    <Link2 className="w-4 h-4" />
                </button>
            </div>

            {/* Editor Content */}
            <div className="border border-t-0 border-gray-300 rounded-b-xs bg-white">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

export default function PoliciesTab({ settings, setSettings, readOnly = false }: PoliciesTabProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Store Policies
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Policies are linked in the footer of checkout and can be added
                    to your online store menu. Use the rich text editor to format your policies.
                </p>
                <div className="space-y-6">
                    {/* Return Policy */}
                    <PolicyEditor
                        title="Return and refund policy"
                        value={settings.policies.return_policy}
                        onChange={(value) =>
                            setSettings({
                                ...settings,
                                policies: {
                                    ...settings.policies,
                                    return_policy: value,
                                },
                            })
                        }
                        badge={settings.policies.return_policy ? 'Set' : 'No policy set'}
                        readOnly={readOnly}
                    />

                    {/* Privacy Policy */}
                    <div className="border border-gray-200 rounded-xs shadow-xs p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">
                                Privacy policy
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                                    Enabled
                                </span>
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                    Automated
                                </span>
                            </div>
                        </div>
                        <label className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                checked={settings.policies.privacy_policy_enabled}
                                onChange={(e) =>
                                    !readOnly && setSettings({
                                        ...settings,
                                        policies: {
                                            ...settings.policies,
                                            privacy_policy_enabled:
                                                e.target.checked,
                                        },
                                    })
                                }
                                disabled={readOnly}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600 disabled:cursor-not-allowed"
                            />
                            <span className="text-sm text-gray-700">
                                Enable privacy policy
                            </span>
                        </label>
                        <PolicyEditor
                            title=""
                            value={settings.policies.privacy_policy}
                            onChange={(value) =>
                                setSettings({
                                    ...settings,
                                    policies: {
                                        ...settings.policies,
                                        privacy_policy: value,
                                    },
                                })
                            }
                            readOnly={readOnly}
                        />
                    </div>

                    {/* Terms of Service */}
                    <PolicyEditor
                        title="Terms of service"
                        value={settings.policies.terms_of_service}
                        onChange={(value) =>
                            setSettings({
                                ...settings,
                                policies: {
                                    ...settings.policies,
                                    terms_of_service: value,
                                },
                            })
                        }
                        badge={settings.policies.terms_of_service ? 'Set' : 'No policy set'}
                        readOnly={readOnly}
                    />

                    {/* Shipping Policy */}
                    <PolicyEditor
                        title="Shipping policy"
                        value={settings.policies.shipping_policy}
                        onChange={(value) =>
                            setSettings({
                                ...settings,
                                policies: {
                                    ...settings.policies,
                                    shipping_policy: value,
                                },
                            })
                        }
                        badge={settings.policies.shipping_policy ? 'Set' : 'No policy set'}
                        readOnly={readOnly}
                    />

                    {/* Contact Information */}
                    <div className="border border-yellow-200 bg-yellow-50 rounded-xs p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Contact information
                                </h3>
                                <p className="text-sm text-gray-700 mb-2">
                                    Required - Contact information must be provided
                                    for legal compliance
                                </p>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={settings.policies.contact_required}
                                        onChange={(e) =>
                                            !readOnly && setSettings({
                                                ...settings,
                                                policies: {
                                                    ...settings.policies,
                                                    contact_required:
                                                        e.target.checked,
                                                },
                                            })
                                        }
                                        disabled={readOnly}
                                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-sm text-gray-700">
                                        Require contact information at checkout
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
