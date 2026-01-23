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
    Send,
    Users,
    Mail,
    FileText,
    Bold,
    Italic,
    List,
    ListOrdered,
    Link2,
    X,
    Package,
} from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    image?: string;
}

export default function EditCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const campaignId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [loadingCampaign, setLoadingCampaign] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        preheader: '',
        fromName: '',
        fromEmail: '',
        replyTo: '',
        recipientSegment: 'all',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize TipTap editor
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false, // Exclude link from StarterKit
            }),
            TiptapLink.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
        ],
        content: '',
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none min-h-[300px] px-4 py-3',
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (editor && campaignId && mounted) {
            loadCampaign();
        }
    }, [editor, campaignId, mounted]);

    const loadCampaign = async () => {
        try {
            const response = await fetch(`/api/admin/marketing/campaigns/${campaignId}`);
            if (response.ok) {
                const campaign = await response.json();
                setFormData({
                    name: campaign.name,
                    subject: campaign.subject,
                    preheader: campaign.preheader || '',
                    fromName: campaign.fromName || '',
                    fromEmail: campaign.fromEmail || '',
                    replyTo: campaign.replyTo || '',
                    recipientSegment: campaign.recipientSegment || 'all',
                });
                // Set content only if editor is ready
                if (editor) {
                    editor.commands.setContent(campaign.content);
                }
            } else {
                alert('Failed to load campaign');
                router.push('/admin/marketing/campaigns');
            }
        } catch (error) {
            console.error('Error loading campaign:', error);
            alert('Failed to load campaign');
            router.push('/admin/marketing/campaigns');
        } finally {
            setLoadingCampaign(false);
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

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Campaign name is required';
        }
        if (!formData.subject.trim()) {
            newErrors.subject = 'Email subject is required';
        }
        if (!formData.fromName.trim()) {
            newErrors.fromName = 'From name is required';
        }
        if (!formData.fromEmail.trim()) {
            newErrors.fromEmail = 'From email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.fromEmail)) {
            newErrors.fromEmail = 'Invalid email address';
        }

        // Check if editor has actual text content
        const editorText = editor?.getText() || '';
        if (!editorText.trim() || editorText.trim() === '') {
            newErrors.content = 'Email content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async (sendNow = false) => {
        if (!validateForm()) return;

        if (sendNow) {
            const confirmed = confirm(
                'Are you sure you want to send this campaign immediately? This action cannot be undone.'
            );
            if (!confirmed) return;
        }

        setLoading(true);
        try {
            const content = editor?.getHTML() || '';
            const response = await fetch(`/api/admin/marketing/campaigns/${campaignId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    content,
                    products: selectedProducts.map(p => p.id),
                    status: sendNow ? 'ACTIVE' : 'DRAFT',
                    sentAt: sendNow ? new Date().toISOString() : null,
                }),
            });

            if (response.ok) {
                router.push('/admin/marketing/campaigns');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update campaign');
            }
        } catch (error) {
            console.error('Error updating campaign:', error);
            alert('Failed to update campaign');
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

    const loadProducts = async () => {
        setLoadingProducts(true);
        try {
            const response = await fetch('/api/admin/products');
            if (response.ok) {
                const data = await response.json();
                const available = data.filter((p: any) => p.availability === 'AVAILABLE');
                setAvailableProducts(available.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.images?.[0]?.url || null,
                })));
            }
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const insertProductCard = (product: Product) => {
        if (!editor) return;

        const productHTML = `
            <div class="product-card" style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; background: white;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 64px; height: 64px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        ${product.image
                ? `<img src="${product.image}" alt="${product.name}" style="width: 64px; height: 64px; object-fit: cover; border-radius: 4px;" />`
                : `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>`
            }
                    </div>
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 500; color: #111827;">${product.name}</h4>
                        <p style="margin: 0; color: #FF5023; font-size: 14px; font-weight: 600;">$${(product.price / 100).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;

        editor.chain().focus().insertContent(productHTML).run();
        setSelectedProducts((prev) => [...prev, product]);
        setShowProductSelector(false);
        setProductSearch('');
    };

    const filteredProducts = availableProducts.filter((product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    if (loadingCampaign) {
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
                            Back to Campaigns
                        </button>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    Edit Campaign
                                </h1>
                                <p className="text-gray-600">
                                    Update your email campaign
                                </p>
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
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-[#FF5023] text-white px-6 py-2.5 rounded-lg hover:bg-[#E64519] transition-colors disabled:opacity-50 font-medium"
                                >
                                    <Send className="w-4 h-4" />
                                    Save and Send Now
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form - Same as new campaign page */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Campaign Details */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#FF5023]" />
                                    Campaign Details
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Campaign Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Subject *
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.subject && (
                                            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preheader Text
                                        </label>
                                        <input
                                            type="text"
                                            name="preheader"
                                            value={formData.preheader}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sender Information */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-[#FF5023]" />
                                    Sender Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            From Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fromName"
                                            value={formData.fromName}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent ${errors.fromName ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.fromName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fromName}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            From Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="fromEmail"
                                            value={formData.fromEmail}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent ${errors.fromEmail ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors.fromEmail && (
                                            <p className="mt-1 text-sm text-red-600">{errors.fromEmail}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reply-To Email
                                        </label>
                                        <input
                                            type="email"
                                            name="replyTo"
                                            value={formData.replyTo}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Email Content Editor */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Email Content *
                                </h3>

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
                                        onClick={() => {
                                            loadProducts();
                                            setShowProductSelector(true);
                                        }}
                                        className="p-2 rounded hover:bg-gray-200 flex items-center gap-1"
                                        title="Add Product Card"
                                    >
                                        <Package className="w-4 h-4" />
                                        <span className="text-xs">Product</span>
                                    </button>
                                </div>

                                {/* Editor Content */}
                                <div className={`border border-t-0 border-gray-300 rounded-b-lg bg-white ${errors.content ? 'border-red-500' : ''
                                    }`}>
                                    {mounted && <EditorContent editor={editor} />}
                                </div>
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Recipients */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-[#FF5023]" />
                                    Recipients
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Audience Segment
                                    </label>
                                    <select
                                        name="recipientSegment"
                                        value={formData.recipientSegment}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                    >
                                        <option value="all">All Subscribers</option>
                                        <option value="active">Active Customers</option>
                                        <option value="inactive">Inactive Customers</option>
                                        <option value="new">New Subscribers</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Selector Modal - Same as new campaign page */}
                    {showProductSelector && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            Select Products
                                        </h3>
                                        <button
                                            onClick={() => {
                                                setShowProductSelector(false);
                                                setProductSearch('');
                                            }}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                        />
                                        <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="p-6 overflow-y-auto max-h-[60vh]">
                                    {loadingProducts ? (
                                        <div className="flex items-center justify-center py-12">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5023]"></div>
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            <p>No available products found</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {filteredProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="border border-gray-200 rounded-lg p-4 hover:border-[#FF5023] cursor-pointer transition-colors"
                                                    onClick={() => insertProductCard(product)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-16 h-16 object-cover rounded"
                                                                />
                                                            ) : (
                                                                <Package className="w-8 h-8 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {product.name}
                                                            </h4>
                                                            <p className="text-[#FF5023] font-semibold">
                                                                ${(product.price / 100).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
