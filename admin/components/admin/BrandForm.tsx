'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import Link from 'next/link';

interface BrandFormProps {
    brandId?: string;
    mode: 'create' | 'edit';
}

export function BrandForm({ brandId, mode }: BrandFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(mode === 'edit');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        logoUrl: '',
        enabled: true,
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');

    useEffect(() => {
        if (mode === 'edit' && brandId) {
            fetchBrand();
        }
    }, [mode, brandId]);

    const fetchBrand = async () => {
        try {
            const response = await fetch(`/api/admin/brands/${brandId}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    description: data.description || '',
                    logoUrl: data.logoUrl || '',
                    enabled: data.enabled,
                });
                // Set preview if logo exists
                if (data.logoUrl) {
                    setLogoPreview(data.logoUrl);
                }
            } else {
                setError('Brand not found');
            }
        } catch (error) {
            console.error('Error fetching brand:', error);
            setError('Failed to load brand');
        } finally {
            setFetchLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));

        // Auto-generate slug from name
        if (name === 'name') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLogoFile(file);

        // Generate preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeLogo = () => {
        setLogoFile(null);
        setLogoPreview('');
        setFormData((prev) => ({ ...prev, logoUrl: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let logoUrl = formData.logoUrl;

            // Upload logo if a new file is selected
            if (logoFile) {
                const formDataImg = new FormData();
                formDataImg.append('file', logoFile);
                formDataImg.append('folder', 'brands');

                const uploadResponse = await fetch('/api/admin/assets', {
                    method: 'POST',
                    body: formDataImg,
                });

                if (uploadResponse.ok) {
                    const uploadData = await uploadResponse.json();
                    logoUrl = uploadData.url;
                } else {
                    throw new Error('Failed to upload logo');
                }
            }

            const url = mode === 'edit' ? `/api/admin/brands/${brandId}` : '/api/admin/brands';
            const method = mode === 'edit' ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    logoUrl,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${mode} brand`);
            }

            router.push('/admin/brands');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <Link
                    href="/admin/brands"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Brands
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Edit Brand' : 'Add New Brand'}
                </h1>
            </div>

            {fetchLoading ? (
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-8">
                    <p className="text-center text-gray-500">Loading brand...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="max-w-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-xs shadow-xs border border-gray-200 p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                                placeholder="e.g., Apple"
                            />
                        </div>

                        <div>
                            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                                URL Slug *
                            </label>
                            <input
                                type="text"
                                id="slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                                placeholder="apple"
                            />
                            <p className="mt-1 text-xs text-gray-500">Auto-generated from brand name</p>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-900 focus:border-transparent"
                                placeholder="Brief description of the brand"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand Logo
                            </label>

                            {logoPreview ? (
                                <div className="relative inline-block">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="w-32 h-32 object-contain border border-gray-300 rounded-xs"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xs cursor-pointer hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-sm text-gray-600">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoSelect}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="enabled"
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary-900 border-gray-300 rounded focus:ring-primary-900"
                            />
                            <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                                Enabled
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                        <Link
                            href="/admin/brands"
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors text-center"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-primary-900 hover:bg-primary-800 text-white rounded-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                        >
                            {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update Brand' : 'Create Brand')}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
}
