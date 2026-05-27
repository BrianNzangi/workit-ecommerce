'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductForm } from './product-form/useProductForm';
import { ProductBasicInfo } from './product-form/ProductBasicInfo';
import { ProductDescription } from './product-form/ProductDescription';
import { ProductShortDescription } from './product-form/ProductShortDescription';
import { ProductImages } from './product-form/ProductImages';
import { ProductPricing } from './product-form/ProductPricing';
import { ProductInventory } from './product-form/ProductInventory';
import { ProductCollections } from './product-form/ProductCollections';
import { ProductHomepageCollections } from './product-form/ProductHomepageCollections';

interface ProductFormProps {
    productId?: string;
    mode: 'create' | 'edit';
}

export function ProductForm({ productId, mode }: ProductFormProps) {
    const {
        formData,
        setFormData,
        loading,
        fetchLoading,
        error,
        uploadingImages,
        taxSettings,
        selectedFiles,
        imagePreviews,
        existingImages,
        collections,
        selectedCollections,
        homepageCollections,
        selectedHomepageCollections,
        brands,
        handleChange,
        handleDescriptionChange,
        handleShortDescriptionChange,
        handleImageSelect,
        removeNewImage,
        removeExistingImage,
        toggleCollection,
        toggleHomepageCollection,
        handleSubmit,
    } = useProductForm({ productId, mode });

    if (fetchLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading product details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Button variant="ghost" asChild className="h-8 px-2 -ml-2 text-sm text-muted-foreground hover:text-foreground">
                    <Link href="/admin/products" className="flex items-center gap-1.5">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Products
                    </Link>
                </Button>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                    {mode === 'create' && (
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading || uploadingImages}
                            onClick={() => handleSubmit(false)}
                        >
                            Save Draft
                        </Button>
                    )}
                    <Button
                        type="button"
                        disabled={loading || uploadingImages}
                        onClick={() => handleSubmit(mode === 'edit' ? undefined : true)}
                        className="bg-primary-900 hover:bg-primary-800 text-white"
                    >
                        {uploadingImages
                            ? 'Uploading Images...'
                            : loading
                                ? mode === 'edit'
                                    ? 'Updating...'
                                    : 'Creating...'
                                : mode === 'edit'
                                    ? 'Update Product'
                                    : 'Publish Product'}
                    </Button>
                </div>
            </div>
            </div>

            <form id="product-form" onSubmit={(e) => e.preventDefault()}>
                {error && (
                    <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="flex flex-col xl:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <ProductBasicInfo
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                            brands={brands}
                        />
                        <ProductImages
                            existingImages={existingImages}
                            imagePreviews={imagePreviews}
                            selectedFiles={selectedFiles}
                            handleImageSelect={handleImageSelect}
                            removeExistingImage={removeExistingImage}
                            removeNewImage={removeNewImage}
                        />
                        <ProductDescription
                            value={formData.description}
                            onChange={handleDescriptionChange}
                        />
                        <ProductShortDescription
                            value={formData.shortDescription}
                            onChange={handleShortDescriptionChange}
                        />
                    </div>

                    <div className="w-full xl:w-80 shrink-0 space-y-6">
                        <ProductPricing
                            formData={formData}
                            handleChange={handleChange}
                        />
                        <ProductInventory
                            formData={formData}
                            handleChange={handleChange}
                            setFormData={setFormData}
                            taxSettings={taxSettings}
                        />
                        <ProductCollections
                            collections={collections}
                            selectedCollections={selectedCollections}
                            toggleCollection={toggleCollection}
                        />
                        <ProductHomepageCollections
                            homepageCollections={homepageCollections}
                            selectedHomepageCollections={selectedHomepageCollections}
                            toggleHomepageCollection={toggleHomepageCollection}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
}
