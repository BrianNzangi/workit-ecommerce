"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { BlogService } from "@/lib/services/content/blog.service";
import { BlogFormFields } from "@/components/admin/marketing/blog/BlogFormFields";
import { BlogEditor } from "@/components/admin/marketing/blog/BlogEditor";
import { BlogSidebar } from "@/components/admin/marketing/blog/BlogSidebar";
import { uploadAdminAsset } from "@/lib/shared/images/admin-asset-upload";

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(false);
    const [fetchingBlog, setFetchingBlog] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [blogId, setBlogId] = useState<string | null>(null);
    const [editorContent, setEditorContent] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        excerpt: "",
        author: "",
        metaTitle: "",
        metaDescription: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [featuredImage, setFeaturedImage] = useState<string | null>(null);
    const [assetId, setAssetId] = useState<string | null>(null);
    const [published, setPublished] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ link: false }),
            TiptapLink.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-blue-600 underline" },
            }),
        ],
        content: "",
        editorProps: {
            attributes: {
                class: "prose max-w-none focus:outline-none min-h-[400px] px-4 py-3",
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        const id = params.id as string;
        if (id) {
            setBlogId(id);
            fetchBlog(id);
        }
    }, [params.id]);

    useEffect(() => {
        if (editor && editorContent !== null) {
            editor.commands.setContent(editorContent || "<p></p>");
        }
    }, [editor, editorContent]);

    const fetchBlog = async (id: string) => {
        try {
            const service = new BlogService();
            const blog = await service.getBlog(id);
            setFormData({
                title: blog.title,
                excerpt: blog.excerpt || "",
                author: blog.author || "",
                metaTitle: blog.metaTitle || "",
                metaDescription: blog.metaDescription || "",
            });
            setPublished(blog.published);
            setEditorContent(blog.content || "");
            if (blog.assetId) {
                setAssetId(blog.assetId);
                if (blog.asset?.source) setFeaturedImage(blog.asset.source);
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to fetch blog post", variant: "error" });
            router.push("/admin/content/blog");
        } finally {
            setFetchingBlog(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
            const { asset: data } = await uploadAdminAsset({ file });
            const imageUrl = data.url || data.source || data.asset?.source || data.preview || data.asset?.preview;
            const uploadedAssetId = data.id || data.asset?.id;
            if (imageUrl && uploadedAssetId) {
                setFeaturedImage(imageUrl);
                setAssetId(uploadedAssetId);
                toast({ title: "Success", description: "Image uploaded successfully", variant: "success" });
            } else {
                toast({ title: "Upload failed", description: "Image uploaded but URL not found", variant: "error" });
            }
        } catch {
            toast({ title: "Upload failed", description: "An error occurred while uploading", variant: "error" });
        } finally {
            setUploadingImage(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!editor?.getHTML() || editor.getHTML() === "<p></p>") newErrors.content = "Content is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateSlug = (title: string): string =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const handleSave = async (shouldPublish = false) => {
        if (!validateForm() || !blogId) return;
        setLoading(true);
        try {
            const content = editor?.getHTML() || "";
            const slug = generateSlug(formData.title);
            const willBePublished = shouldPublish || published;
            const requestBody: any = { title: formData.title, slug, content, published: willBePublished };
            if (formData.excerpt) requestBody.excerpt = formData.excerpt;
            if (formData.author) requestBody.author = formData.author;
            if (assetId) requestBody.assetId = assetId;
            if (formData.metaTitle) requestBody.metaTitle = formData.metaTitle;
            if (formData.metaDescription) requestBody.metaDescription = formData.metaDescription;
            if (willBePublished && !published) requestBody.publishedAt = new Date().toISOString();
            const service = new BlogService();
            await service.updateBlog(blogId, requestBody);
            toast({ title: "Success", description: "Blog post updated successfully", variant: "success" });
            router.push("/admin/content/blog");
        } catch (error: any) {
            toast({ title: "Update failed", description: error.message || "Failed to update blog post", variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (fetchingBlog) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/content/blog")} className="mb-3 rounded-sm">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back to Blog Posts
                        </Button>
                        <div className="flex items-center justify-between">
                            <h1 className="text-lg font-semibold">Edit blog post</h1>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleSave(false)}
                                    disabled={loading}
                                    className="rounded-sm"
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                    Save as Draft
                                </Button>
                                <Button
                                    onClick={() => handleSave(true)}
                                    disabled={loading}
                                    className="rounded-sm"
                                >
                                    {published ? <Save className="w-4 h-4 mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
                                    {published ? "Save & Keep Published" : "Publish"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <div className="lg:col-span-2 space-y-5">
                            <BlogFormFields formData={formData} onChange={handleChange} errors={errors} />
                            <BlogEditor editor={editor} error={errors.content} />
                        </div>
                        <BlogSidebar
                            featuredImage={featuredImage}
                            onImageUpload={handleImageUpload}
                            onImageRemove={() => { setFeaturedImage(null); setAssetId(null); }}
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
