'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { ProductService } from '@/lib/services';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shared/utils/cn';
import { BannerLinkedProduct } from './types';

interface BannerProductPickerProps {
    value: string;
    selectedProduct: BannerLinkedProduct | null;
    onChange: (product: BannerLinkedProduct | null) => void;
    disabled?: boolean;
}

function normalizeProduct(product: any): BannerLinkedProduct {
    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku ?? null,
    };
}

export function BannerProductPicker({
    value,
    selectedProduct,
    onChange,
    disabled,
}: BannerProductPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<BannerLinkedProduct[]>([]);
    const [error, setError] = useState('');

    const hasSelection = Boolean(value && selectedProduct);
    const triggerLabel = selectedProduct
        ? selectedProduct.name
        : 'Search and select a product';

    useEffect(() => {
        if (!open) {
            setQuery('');
            setResults([]);
            setError('');
            setLoading(false);
            return;
        }

        const trimmedQuery = deferredQuery.trim();
        if (trimmedQuery.length < 2) {
            setResults([]);
            setLoading(false);
            setError(trimmedQuery.length === 0 ? '' : 'Type at least 2 characters to search.');
            return;
        }

        let cancelled = false;

        const loadResults = async () => {
            setLoading(true);
            setError('');

            try {
                const productService = new ProductService();
                const data = await productService.searchProducts(trimmedQuery);

                if (!cancelled) {
                    setResults((data || []).slice(0, 12).map(normalizeProduct));
                }
            } catch (searchError) {
                console.error('Error searching products:', searchError);
                if (!cancelled) {
                    setResults([]);
                    setError('Could not load products. Try another search.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadResults();

        return () => {
            cancelled = true;
        };
    }, [deferredQuery, open]);

    const emptyState = useMemo(() => {
        if (loading) return null;
        if (error) return error;
        if (deferredQuery.trim().length < 2) return 'Search by product name, slug, or SKU.';
        if (results.length === 0) return 'No matching products found.';
        return null;
    }, [deferredQuery, error, loading, results.length]);

    return (
        <>
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        disabled={disabled}
                        className={cn(
                            'flex h-10 w-full items-center justify-between rounded-sm border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
                            !hasSelection && 'text-secondary-500'
                        )}
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <Search className="h-4 w-4 text-secondary-400" />
                            <span className="truncate">{triggerLabel}</span>
                        </span>
                        <span className="text-xs font-medium text-secondary-400">
                            {hasSelection ? 'Change' : 'Select'}
                        </span>
                    </button>

                    {hasSelection ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-10 shrink-0 px-3 text-secondary-600"
                            onClick={() => onChange(null)}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
                    ) : null}
                </div>

                {selectedProduct ? (
                    <p className="text-xs font-medium text-secondary-500">
                        {selectedProduct.slug}
                        {selectedProduct.sku ? ` • SKU ${selectedProduct.sku}` : ''}
                    </p>
                ) : null}
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl border-gray-200 p-0">
                    <DialogHeader className="border-b border-gray-100 px-6 py-4">
                        <DialogTitle className="text-lg font-black tracking-tight text-secondary-900">
                            Select Product
                        </DialogTitle>
                        <DialogDescription className="font-medium text-secondary-500">
                            Search by product name, slug, or SKU and pick one banner target.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 px-6 py-5">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search products..."
                                className="border-gray-200 pl-9 focus-visible:ring-primary-200"
                                autoFocus
                            />
                        </div>

                        <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-100">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm font-medium text-secondary-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Searching products...
                                </div>
                            ) : null}

                            {!loading && emptyState ? (
                                <div className="px-4 py-8 text-center text-sm font-medium text-secondary-500">
                                    {emptyState}
                                </div>
                            ) : null}

                            {!loading && results.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {results.map((product) => {
                                        const isSelected = selectedProduct?.id === product.id;

                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() => {
                                                    onChange(product);
                                                    setOpen(false);
                                                }}
                                                className={cn(
                                                    'flex w-full items-start justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-primary-50',
                                                    isSelected && 'bg-primary-50'
                                                )}
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <p className="truncate text-sm font-semibold text-secondary-900">
                                                        {product.name}
                                                    </p>
                                                    <p className="truncate text-xs font-medium text-secondary-500">
                                                        {product.slug}
                                                        {product.sku ? ` • SKU ${product.sku}` : ''}
                                                    </p>
                                                </div>

                                                {isSelected ? (
                                                    <span className="rounded-full bg-primary-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-800">
                                                        Selected
                                                    </span>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
