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
import { toast } from '@/hooks/use-toast';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    author: string | null;
    published: boolean;
    publishedAt: string | null;
    featuredImageUrl: string | null;
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
        author: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [published, setPublished] = useState(false);

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
                const blog: BlogPost = await response.json();
                setFormData({
                    title: blog.title,
                    excerpt: blog.excerpt || '',
                    author: blog.author || '',
                });
                setPublished(blog.published);
                setFeaturedImage(blog.featuredImageUrl);
                if (editor) {
                    editor.commands.setContent(blog.content);
                }
            } else {
                const error = await response.json();
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to fetch blog post',
                    variant: 'error',
                });
                router.push('/admin/blog');
            }
        } catch (error) {
            console.error('Error fetching blog:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch blog post',
                variant: 'error',
            });
            router.push('/admin/blog');
        } finally {
            setFetchingBlog(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

            const response = await fetch('/api/admin/assets', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setFeaturedImage(data.source);
                toast({
                    title: 'Success',
                    description: 'Image uploaded successfully',
                    variant: 'success',
                });
            } else {
                toast({
                    title: 'Upload failed',
                    description: 'Failed to upload image',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: 'Upload failed',
                description: 'An error occurred while uploading',
                variant: 'error',
            });
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

    const generateSlug = (title: string): string => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleSave = async (shouldPublish = false) => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const content = editor?.getHTML() || '';
            const slug = generateSlug(formData.title);
            const willBePublished = shouldPublish || published;

            // Build request body, only including fields with values
            const requestBody: any = {
                title: formData.title,
                slug,
                content,
                published: willBePublished,
            };

            if (formData.excerpt) {
                requestBody.excerpt = formData.excerpt;
            }

            if (formData.author) {
                requestBody.author = formData.author;
            }

            if (featuredImage) {
                requestBody.featuredImageUrl = featuredImage;
            }

            // Only set publishedAt when publishing for the first time
            if (willBePublished && !published) {
                requestBody.publishedAt = new Date();
            }

            const response = await fetch(`/api/admin/blog/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Blog post updated successfully`,
                    variant: 'success',
                });
                router.push('/admin/blog');
            } else {
                const error = await response.json();
                toast({
                    title: 'Update failed',
                    description: error.message || error.error || 'Failed to update blog post',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating blog:', error);
            toast({
                title: 'Update failed',
                description: 'An error occurred while updating',
                variant: 'error',
            });
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
            editor.chain().focus().insertContent(`<img src="${url}" alt="Image" class="max-w-full h-auto rounded-lg" />`).run();
        }
    };

    if (fetchingBlog) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
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
                                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-xs hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
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
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g., Blog about your latest products or deals"
                                    className={`w-full px-4 py-2 border rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent ${errors.title ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Content Editor */}
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content
                                </label>

                                {/* Editor Toolbar */}
                                <div className="border border-gray-300 rounded-t-xs bg-gray-50 p-2 flex items-center gap-2 flex-wrap">
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
                                    className={`border border-t-0 border-gray-300 rounded-b-xs bg-white ${errors.content ? 'border-red-500' : ''
                                        }`}
                                >
                                    <EditorContent editor={editor} />
                                </div>
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
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
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Status
                                </h3>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={published}
                                            onChange={(e) => setPublished(e.target.checked)}
                                            className="text-primary-600 focus:ring-primary-600"
                                        />
                                        <span className="text-sm text-gray-700">Published</span>
                                    </label>
                                </div>
                            </div>

                            {/* Featured Image */}
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">Featured Image</h3>
                                {featuredImage ? (
                                    <div className="relative">
                                        <img
                                            src={featuredImage}
                                            alt="Featured"
                                            className="w-full h-48 object-cover rounded-xs"
                                        />
                                        <button
                                            onClick={() => setFeaturedImage(null)}
                                            className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-xs hover:bg-red-600 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-xs p-8 text-center">
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
                                                {uploadingImage ? 'Uploading...' : 'Add image'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                or drop an image to upload
                                            </p>
                                        </label>
                                    </div>
                                )}
                            </div>

                            {/* Author */}
                            <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">
                                    Author
                                </h3>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleChange}
                                    placeholder="Author name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
