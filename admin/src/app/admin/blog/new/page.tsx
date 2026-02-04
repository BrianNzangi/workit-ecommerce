'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BlogService } from '@/lib/services/content/blog.service';
import { BlogFormFields } from '@/components/admin/marketing/blog/BlogFormFields';
import { BlogEditor } from '@/components/admin/marketing/blog/BlogEditor';
import { BlogSidebar } from '@/components/admin/marketing/blog/BlogSidebar';

export default function NewBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        author: 'New Workit',
        metaTitle: '',
        metaDescription: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [assetId, setAssetId] = useState<string | null>(null);

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
        content: '<p>Start writing your blog post...</p>',
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[400px] px-4 py-3',
            },
        },
        immediatelyRender: false,
    });

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
                // Handle both response structures: data.source or data.asset.source
                const imageUrl = data.source || data.asset?.source || data.preview || data.asset?.preview;
                const uploadedAssetId = data.id || data.asset?.id;

                if (imageUrl && uploadedAssetId) {
                    setFeaturedImage(imageUrl);
                    setAssetId(uploadedAssetId);
                    toast({
                        title: 'Success',
                        description: 'Image uploaded successfully',
                        variant: 'success',
                    });
                } else {
                    console.error('No image URL in response:', data);
                    toast({
                        title: 'Upload failed',
                        description: 'Image uploaded but URL not found',
                        variant: 'error',
                    });
                }
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

    const handleSave = async (publish = false) => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const content = editor?.getHTML() || '';
            const slug = generateSlug(formData.title);

            // Build request body, only including fields with values
            const requestBody: any = {
                title: formData.title,
                slug,
                content,
                published: publish,
            };

            if (formData.excerpt) {
                requestBody.excerpt = formData.excerpt;
            }

            if (formData.author) {
                requestBody.author = formData.author;
            }

            if (assetId) {
                requestBody.assetId = assetId;
            }

            if (formData.metaTitle) {
                requestBody.metaTitle = formData.metaTitle;
            }

            if (formData.metaDescription) {
                requestBody.metaDescription = formData.metaDescription;
            }

            if (publish) {
                requestBody.publishedAt = new Date().toISOString();
            }

            console.log('[Frontend] Sending blog data:', requestBody);
            console.log('[Frontend] publishedAt type:', typeof requestBody.publishedAt, requestBody.publishedAt);

            const service = new BlogService();
            await service.createBlog(requestBody);

            toast({
                title: 'Success',
                description: `Blog post ${publish ? 'published' : 'saved as draft'} successfully`,
                variant: 'success',
            });
            router.push('/admin/blog');
        } catch (error: any) {
            console.error('Error creating blog:', error);
            toast({
                title: 'Save failed',
                description: error.message || 'Failed to create blog post',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

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
                                    Add blog post
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleSave(false)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
                                >
                                    <Save className="w-4 h-4" />
                                    Save as Draft
                                </button>
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 font-medium"
                                >
                                    <Eye className="w-4 h-4" />
                                    Publish
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <BlogFormFields
                                formData={formData}
                                onChange={handleChange}
                                errors={errors}
                            />
                            <BlogEditor editor={editor} error={errors.content} />
                        </div>

                        {/* Sidebar */}
                        <BlogSidebar
                            featuredImage={featuredImage}
                            onImageUpload={handleImageUpload}
                            onImageRemove={() => setFeaturedImage(null)}
                            author={formData.author}
                            onAuthorChange={handleChange}
                            uploadingImage={uploadingImage}
                            metaTitle={formData.metaTitle}
                            metaDescription={formData.metaDescription}
                            onMetaChange={handleChange}
                            formData={formData}
                        />
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
