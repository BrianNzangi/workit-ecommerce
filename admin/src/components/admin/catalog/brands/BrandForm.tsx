'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import { uploadAdminAsset } from '@/lib/shared/images/admin-asset-upload';
import {
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    ensureCsrfToken,
    getCookieValue,
    getSessionUrl,
} from '@/lib/auth/csrf';

const AUTH_SESSION_URL = getSessionUrl(
    process.env.NEXT_PUBLIC_AUTH_PATH || '/api/auth',
    process.env.NEXT_PUBLIC_AUTH_BASE_URL || '',
);

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

    const [collectionIds, setCollectionIds] = useState<string[]>([]);
    const [collectionOptions, setCollectionOptions] = useState<{ value: string; label: string }[]>([]);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState('');

    useEffect(() => {
        fetchCollections();
        if (mode === 'edit' && brandId) {
            fetchBrand();
        }
    }, [mode, brandId]);

    const fetchCollections = async () => {
        try {
            const res = await fetch('/api/admin/collections?parentId=null');
            if (res.ok) {
                const data = await res.json();
                const collections = data.collections || data || [];
                const l1Collections = Array.isArray(collections)
                    ? collections.filter((c: any) => !c.parentId)
                    : [];
                setCollectionOptions(
                    l1Collections.map((c: any) => ({ value: c.id, label: c.name }))
                );
            }
        } catch (e) {
            console.error('Failed to fetch collections:', e);
        }
    };

    const fetchBrand = async () => {
        try {
            const response = await fetch(`/api/admin/brands/${brandId}`);
            if (response.ok) {
                const result = await response.json();
                const data = result.brand || result;
                setFormData({
                    name: data.name,
                    slug: data.slug,
                    description: data.description || '',
                    logoUrl: data.logoUrl || '',
                    enabled: data.enabled,
                });
                if (data.brandCollections?.length) {
                    setCollectionIds(data.brandCollections.map((bc: any) => bc.collectionId));
                }
                if (data.logoUrl) {
                    setLogoPreview(getImageUrl(data.logoUrl));
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

            if (logoFile) {
                const { asset: uploadData } = await uploadAdminAsset({
                    file: logoFile,
                    folder: 'brands',
                });
                logoUrl = uploadData.url;
            }

            const url = mode === 'edit' ? `/api/admin/brands/${brandId}` : '/api/admin/brands';
            const method = mode === 'edit' ? 'PATCH' : 'POST';

            const csrfToken = (await ensureCsrfToken(AUTH_SESSION_URL)) || getCookieValue(CSRF_COOKIE_NAME);
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (csrfToken) {
                headers[CSRF_HEADER_NAME] = csrfToken;
            }

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify({
                    ...formData,
                    logoUrl,
                    collectionIds,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to ${mode} brand`);
            }

            toast({
                title: 'Success',
                description: mode === 'edit' ? 'Brand updated successfully' : 'Brand created successfully',
                variant: 'success',
            });

            router.push('/admin/brands');
        } catch (err: any) {
            setError(err.message);
            toast({
                title: 'Error',
                description: err.message,
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-lg font-semibold">
                        {mode === 'edit' ? 'Edit Brand' : 'New Brand'}
                    </h1>
                </div>
                <Card className="rounded-sm shadow-none">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground">Loading brand...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-lg font-semibold">
                        {mode === 'edit' ? 'Edit Brand' : 'New Brand'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <Card className="rounded-sm shadow-none mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-sm font-semibold mb-4">Basic Information</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-sm text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Brand Name *</Label>
                                <Input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Apple"
                                    className="rounded-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>URL Slug *</Label>
                                <Input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="apple"
                                    className="rounded-sm font-mono text-xs"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Auto-generated from brand name</p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Brief description of the brand"
                                className="resize-none h-20 rounded-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Logo */}
                <Card className="rounded-sm shadow-none mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-sm font-semibold mb-4">Brand Logo</h2>

                        {logoPreview ? (
                            <div className="relative inline-block">
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-32 h-32 object-contain border rounded-sm"
                                />
                                <button
                                    type="button"
                                    onClick={removeLogo}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed rounded-sm cursor-pointer hover:bg-muted/50 transition-colors">
                                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">Upload Logo</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoSelect}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </CardContent>
                </Card>

                {/* Featured in Collections */}
                <Card className="rounded-sm shadow-none mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-sm font-semibold mb-4">Featured in Collections</h2>
                        <p className="text-xs text-muted-foreground mb-3">
                            Select collections where this brand should appear in the Top Brands carousel.
                        </p>
                        <MultiSelect
                            options={collectionOptions}
                            selected={collectionIds}
                            onChange={setCollectionIds}
                            placeholder="Select collections..."
                        />
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card className="rounded-sm shadow-none mb-6">
                    <CardContent className="p-6">
                        <h2 className="text-sm font-semibold mb-4">Settings</h2>

                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                id="enabled"
                                name="enabled"
                                checked={formData.enabled}
                                onChange={handleChange}
                                className="w-4 h-4 rounded-sm accent-primary"
                            />
                            <span className="text-sm">Enabled</span>
                        </label>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="rounded-sm"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="rounded-sm">
                        {loading ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save' : 'Create')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
