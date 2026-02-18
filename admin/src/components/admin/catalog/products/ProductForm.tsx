'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductForm } from './product-form/useProductForm';
import { ProductBasicInfo } from './product-form/ProductBasicInfo';
import { ProductDescription } from './product-form/ProductDescription';
import { ProductPricing } from './product-form/ProductPricing';
import { ProductStatus } from './product-form/ProductStatus';
import { ProductImages } from './product-form/ProductImages';
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
        displaySalePrice,
        displayOriginalPrice,
        collections,
        selectedCollections,
        expandedCollections,
        homepageCollections,
        selectedHomepageCollections,
        brands,
        handleChange,
        handleDescriptionChange,
        handlePriceChange,
        handlePriceBlur,
        handlePriceFocus,
        handleImageSelect,
        removeNewImage,
        removeExistingImage,
        toggleCollection,
        toggleExpanded,
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
        <>
            {/* Header */}
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 -ml-4 text-muted-foreground hover:text-foreground">
                    <Link href="/admin/products" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Products
                    </Link>
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-xl lg:text-2xl font-bold tracking-tight">
                        {mode === 'edit' ? 'Edit Product' : 'Add New Product'}
                    </h1>
                    <div className="flex gap-2 sm:gap-3">
                        <Button variant="outline" asChild className="flex-1 sm:flex-none sm:px-6">
                            <Link href="/admin/products">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            form="product-form"
                            disabled={loading || uploadingImages}
                            className="flex-1 sm:flex-none sm:px-8 bg-primary text-white"
                        >
                            {uploadingImages
                                ? 'Uploading Images...'
                                : loading
                                    ? mode === 'edit'
                                        ? 'Updating...'
                                        : 'Creating...'
                                    : mode === 'edit'
                                        ? 'Update Product'
                                        : 'Create Product'}
                        </Button>
                    </div>
                </div>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-red-700 text-sm shadow-xs">
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
                            taxSettings={taxSettings}
                        />
                        <ProductDescription
                            value={formData.description}
                            onChange={handleDescriptionChange}
                        />
                    </div>

                    <div className="w-full xl:w-[400px] 2xl:w-[575px] shrink-0 space-y-6">
                        <ProductStatus
                            enabled={formData.enabled}
                            onEnabledChange={(val: boolean) => setFormData((prev: any) => ({ ...prev, enabled: val }))}
                        />
                        <ProductPricing
                            displaySalePrice={displaySalePrice}
                            displayOriginalPrice={displayOriginalPrice}
                            handlePriceChange={handlePriceChange}
                            handlePriceBlur={handlePriceBlur}
                            handlePriceFocus={handlePriceFocus}
                        />
                        <ProductImages
                            existingImages={existingImages}
                            imagePreviews={imagePreviews}
                            selectedFiles={selectedFiles}
                            handleImageSelect={handleImageSelect}
                            removeExistingImage={removeExistingImage}
                            removeNewImage={removeNewImage}
                        />
                        <ProductCollections
                            collections={collections}
                            selectedCollections={selectedCollections}
                            expandedCollections={expandedCollections}
                            toggleCollection={toggleCollection}
                            toggleExpanded={toggleExpanded}
                        />
                        <ProductHomepageCollections
                            homepageCollections={homepageCollections}
                            selectedHomepageCollections={selectedHomepageCollections}
                            toggleHomepageCollection={toggleHomepageCollection}
                        />
                    </div>
                </div>
            </form>
        </>
    );
}
