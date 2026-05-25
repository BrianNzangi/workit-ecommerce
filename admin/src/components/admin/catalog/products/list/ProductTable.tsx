'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/shared/images/image-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { AdminProduct } from '@/lib/products/product.types';
import { CAMPAIGN_TYPE_LABELS, DISCOUNT_TYPE_LABELS } from '@/lib/products/product.constants';

interface ProductTableProps {
    products: AdminProduct[];
    onDelete: (id: string, name: string) => void;
}

function ProductImage({ asset, name }: { asset: any; name: string }) {
    const [error, setError] = useState(false);

    if (!asset || error) {
        return (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary-50">
                <ImageIcon className="h-5 w-5 text-secondary-300" />
            </div>
        );
    }

    const source = asset.asset?.source ?? asset.source ?? null;
    if (!source) {
        return (
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary-50">
                <ImageIcon className="h-5 w-5 text-secondary-300" />
            </div>
        );
    }

    return (
        <img
            src={getImageUrl(source)}
            alt={name}
            loading="lazy"
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover"
            onError={() => setError(true)}
        />
    );
}

function StockBadge({ stock }: { stock: number }) {
    if (stock <= 0) {
        return (
            <Badge variant="destructive" className="text-xs">
                Out of stock
            </Badge>
        );
    }
    if (stock <= 10) {
        return (
            <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                {stock}
            </Badge>
        );
    }
    return <span className="text-sm">{stock}</span>;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
    const formatPrice = (price: number) => {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getProductPrice = (product: AdminProduct): string => {
        if (product.salePrice) {
            return `KES ${formatPrice(product.salePrice)}`;
        }
        if (product.originalPrice) {
            return `KES ${formatPrice(product.originalPrice)}`;
        }
        return '—';
    };

    const renderCampaignTypes = (types?: string[]) => {
        if (!types || types.length === 0) return <span className="text-secondary-300">—</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {types.slice(0, 2).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                        {CAMPAIGN_TYPE_LABELS[type] || type}
                    </Badge>
                ))}
                {types.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                        +{types.length - 2}
                    </Badge>
                )}
            </div>
        );
    };

    const renderDiscountTypes = (types?: string[]) => {
        if (!types || types.length === 0) return <span className="text-secondary-300">—</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {types.slice(0, 2).map((type) => (
                    <Badge key={type} variant="outline" className="text-xs">
                        {DISCOUNT_TYPE_LABELS[type] || type}
                    </Badge>
                ))}
                {types.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                        +{types.length - 2}
                    </Badge>
                )}
            </div>
        );
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.slice(0, maxLength) + '...';
    };

    return (
        <div className="rounded-lg bg-white">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-secondary-100">
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Collections</TableHead>
                            <TableHead className="w-24">Homepage</TableHead>
                            <TableHead className="w-28">Price</TableHead>
                            <TableHead className="w-20">Stock</TableHead>
                            <TableHead className="w-20">Status</TableHead>
                            <TableHead className="w-48">Campaign</TableHead>
                            <TableHead className="w-20 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="border-b border-secondary-50 last:border-b-0 hover:bg-secondary-50/50">
                                <TableCell>
                                    <ProductImage
                                        asset={product.assets?.[0]?.asset ?? product.assets?.[0]}
                                        name={product.name}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                        className="group flex flex-col gap-0.5"
                                    >
                                        <span className="font-medium text-secondary-900 group-hover:text-primary-800 transition-colors">
                                            {truncateText(product.name, 40)}
                                        </span>
                                        <span className="text-xs text-secondary-400">
                                            {truncateText(product.slug, 30)}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm max-w-48">
                                        {product.collections && product.collections.length > 0
                                            ? truncateText(
                                                  product.collections.map((pc: any) => pc.collection.name).join(', '),
                                                  30
                                              )
                                            : <span className="text-secondary-300">—</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {product.homepageCollections && product.homepageCollections.length > 0 ? (
                                        <Badge variant="default" className="text-xs">Yes</Badge>
                                    ) : (
                                        <Badge variant="secondary" className="text-xs">No</Badge>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                    {getProductPrice(product)}
                                </TableCell>
                                <TableCell>
                                    <StockBadge stock={product.stockOnHand ?? 0} />
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={product.enabled ? "default" : "secondary"}
                                        className="text-xs"
                                    >
                                        {product.enabled ? 'Active' : 'Draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        {renderCampaignTypes(product.campaignTypes)}
                                        {renderDiscountTypes(product.discountTypes)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(product.id, product.name)}
                                            className="h-8 w-8 text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
