'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';

import {
    ArrowLeft,
    Save,
    FileText,
    Bold,
    Italic,
    List,
    ListOrdered,
    Link2,
    Image as ImageIcon,
    Upload,
} from 'lucide-react';

interface Blog {
    id: string;
    title: string;
    content: string;
    excerpt: string | null;
    published: boolean;
    publishedAt: Date | null;
    asset?: {
        source: string;
    };
    categories: Array<{
        name: string;
    }>;
}

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchingBlog, setFetchingBlog] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        author: 'New Workit',
        blog: 'News',
        tags: '',
        visibility: 'hidden',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);

    // Initialize TipTap editor
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
        content: '<p>Loading...</p>',
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (params.id) {
            fetchBlog();
        }
    }, [params.id]);

    const fetchBlog = async () => {
        try {
            const response = await fetch(`/api/admin/blog/${params.id}`);
            if (response.ok) {
                const blog: Blog = await response.json();
                setFormData({
                    title: blog.title,
                    excerpt: blog.excerpt || '',
                    author: 'New Workit',
                    blog: 'News',
                    tags: blog.categories.map((c) => c.name).join(', '),
                    visibility: blog.published ? 'visible' : 'hidden',
                });
                if (blog.asset?.source) {
                    setFeaturedImage(blog.asset.source);
                }
                if (editor) {
                    editor.commands.setContent(blog.content);
                }
            } else {
                alert('Failed to fetch blog post');
                router.push('/admin/blog');
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            alert('Failed to fetch blog post');
            router.push('/admin/blog');
        } finally {
            setFetchingBlog(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/admin/assets/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFeaturedImage(data.url);
            } else {
                alert('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!editor?.getHTML() || editor.getHTML() === '<p></p>') {
            newErrors.content = 'Content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (publish = false) => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const content = editor?.getHTML() || '';
            const response = await fetch(`/api/admin/blog/${params.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    content,
                    excerpt: formData.excerpt || null,
                    published: publish || formData.visibility === 'visible',
                    publishedAt: publish ? new Date().toISOString() : null,
                    featuredImage,
                    categories: formData.tags
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag.length > 0),
                }),
            });

            if (response.ok) {
                router.push('/admin/blog');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update blog post');
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            alert('Failed to update blog post');
        } finally {
            setLoading(false);
        }
    };

    const addLink = () => {
        const url = window.prompt('Enter URL:');
        if (url && editor) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url && editor) {
            // Insert image as HTML since Image extension is not installed
            editor.chain().focus().insertContent(`<img src="${url}" alt="Image" class="max-w-full h-auto rounded-lg" />`).run();
        }
    };

    if (fetchingBlog) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5023]"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Blog Posts
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Edit blog post
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleSave(false)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Title */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Blog about your latest products or deals"
                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Content Editor */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content
                                </label>

                                {/* Editor Toolbar */}
                                <div className="border border-gray-300 rounded-t-lg bg-gray-50 p-2 flex items-center gap-2 flex-wrap">
                                    <select className="px-2 py-1 border border-gray-300 rounded text-sm">
                                        <option>Paragraph</option>
                                        <option>Heading 1</option>
                                        <option>Heading 2</option>
                                    </select>
                                    <div className="w-px h-6 bg-gray-300"></div>
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
                                        onClick={() =>
                                            editor?.chain().focus().toggleBulletList().run()
                                        }
                                        className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bulletList') ? 'bg-gray-300' : ''
                                            }`}
                                        title="Bullet List"
                                    >
                                        <List className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            editor?.chain().focus().toggleOrderedList().run()
                                        }
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
                                    className={`border border-t-0 border-gray-300 rounded-b-lg bg-white ${errors.content ? 'border-red-500' : ''
                                        }`}
                                >
                                    <EditorContent editor={editor} />
                                </div>
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Excerpt
                                </label>
                                <p className="text-sm text-gray-500 mb-2">
                                    Add a summary of the post to appear on your home page or blog.
                                </p>
                                <textarea
                                    name="excerpt"
                                    value={formData.excerpt}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                />
                            </div>

                            {/* SEO Section */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-700">
                                        Search engine listing
                                    </h3>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Add a title and description to see how this blog post might appear in a
                                    search engine listing
                                </p>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Visibility */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Visibility
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="visible"
                                            checked={formData.visibility === 'visible'}
                                            onChange={handleChange}
                                            className="text-[#FF5023] focus:ring-[#FF5023]"
                                        />
                                        <span className="text-sm text-gray-700">Visible</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            value="hidden"
                                            checked={formData.visibility === 'hidden'}
                                            onChange={handleChange}
                                            className="text-[#FF5023] focus:ring-[#FF5023]"
                                        />
                                        <span className="text-sm text-gray-700">Hidden</span>
                                    </label>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Image</h3>
                                {featuredImage ? (
                                    <div className="relative">
                                        <img
                                            src={featuredImage}
                                            alt="Featured"
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                        <button
                                            onClick={() => setFeaturedImage(null)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                            disabled={uploadingImage}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer"
                                        >
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm text-gray-600 font-medium">
                                                Add image
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                or drop an image to upload
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Organization */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Organization
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Author
                                        </label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Blog
                                        </label>
                                        <select
                                            name="blog"
                                            value={formData.blog}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        >
                                            <option>News</option>
                                            <option>Updates</option>
                                            <option>Guides</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            name="tags"
                                            value={formData.tags}
                                            onChange={handleChange}
                                            placeholder="Comma separated tags"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Theme Template */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Theme template
                                </h3>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent">
                                    <option>Default blog post</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
