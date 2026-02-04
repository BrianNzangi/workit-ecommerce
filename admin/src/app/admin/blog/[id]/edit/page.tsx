'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapLink from '@tiptap/extension-link';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { BlogService } from '@/lib/services/content/blog.service';
import { BlogFormFields } from '@/components/admin/marketing/blog/BlogFormFields';
import { BlogEditor } from '@/components/admin/marketing/blog/BlogEditor';
import { BlogSidebar } from '@/components/admin/marketing/blog/BlogSidebar';

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
    metaTitle?: string | null;
    metaDescription?: string | null;
}

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchingBlog, setFetchingBlog] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [blogId, setBlogId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        author: '',
        metaTitle: '',
        metaDescription: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [assetId, setAssetId] = useState<string | null>(null);
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
        // Extract ID from params
        const id = params.id as string;
        if (id) {
            setBlogId(id);
            fetchBlog(id);
        }
    }, [params.id]);

    const fetchBlog = async (id: string) => {
        try {
            const service = new BlogService();
            const blog = await service.getBlog(id);

            setFormData({
                title: blog.title,
                excerpt: blog.excerpt || '',
                author: blog.author || '',
                metaTitle: blog.metaTitle || '',
                metaDescription: blog.metaDescription || '',
            });
            setPublished(blog.published);

            // Load image from asset if available
            if (blog.assetId) {
                setAssetId(blog.assetId);
                // If blog has asset relation populated, use it
                if (blog.asset?.source) {
                    setFeaturedImage(blog.asset.source);
                }
            }

            if (editor) {
                editor.commands.setContent(blog.content);
            }
        } catch (error: any) {
            console.error('Error fetching blog:', error);
            toast({
                title: 'Error',
                description: error.message || 'Failed to fetch blog post',
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
                console.log('Upload response data:', data);
                // Handle various response structures for maximum compatibility
                const imageUrl = data.url || data.source || data.asset?.source || data.preview || data.asset?.preview;
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

    const handleSave = async (shouldPublish = false) => {
        if (!validateForm() || !blogId) return;

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

            if (assetId) {
                requestBody.assetId = assetId;
            }

            if (formData.metaTitle) {
                requestBody.metaTitle = formData.metaTitle;
            }

            if (formData.metaDescription) {
                requestBody.metaDescription = formData.metaDescription;
            }

            // Only set publishedAt when publishing for the first time
            if (willBePublished && !published) {
                requestBody.publishedAt = new Date().toISOString();
            }

            const service = new BlogService();
            await service.updateBlog(blogId, requestBody);

            toast({
                title: 'Success',
                description: `Blog post updated successfully`,
                variant: 'success',
            });
            router.push('/admin/blog');
        } catch (error: any) {
            console.error('Error updating blog:', error);
            toast({
                title: 'Update failed',
                description: error.message || 'Failed to update blog post',
                variant: 'error',
            });
        } finally {
            setLoading(false);
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
                                    {published ? <Save className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                    {published ? 'Save & Keep Published' : 'Publish'}
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
