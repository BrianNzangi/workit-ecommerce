'use client';

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

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    salePrice: number | null;
    originalPrice: number | null;
    enabled: boolean;
    createdAt: string;
    stockOnHand: number;
    collections?: Array<{
        collection: {
            id: string;
            name: string;
        };
    }>;
    homepageCollections?: Array<{
        collection: {
            id: string;
            title: string;
        };
    }>;
    assets?: Array<{
        asset: {
            source: string;
        };
    }>;
    campaignType?: string | null;
    campaignTypes?: string[];
    discountType?: string | null;
    discountTypes?: string[];
}

interface ProductTableProps {
    products: Product[];
    onDelete: (id: string, name: string) => void;
}

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
    SEASONAL: 'Seasonal',
    PROMOTIONAL: 'Promotional',
    PRODUCT_LAUNCH: 'Product Launch',
    HOLIDAY: 'Holiday',
    LOYALTY: 'Loyalty',
    RE_ENGAGEMENT: 'Re-engagement',
    OTHER: 'Other',
};

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
    NONE: 'No Discount',
    PERCENTAGE: 'Percentage Off',
    FIXED_AMOUNT: 'Fixed Amount Off',
    FREE_SHIPPING: 'Free Shipping',
    BUY_X_GET_Y: 'Buy X Get Y',
};

export function ProductTable({ products, onDelete }: ProductTableProps) {
    const formatPrice = (price: number) => {
        return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getProductPrice = (product: Product): string => {
        if (product.salePrice) {
            return `KES ${formatPrice(product.salePrice)}`;
        }
        return 'N/A';
    };

    const renderCampaignTypes = (types?: string[]) => {
        if (!types || types.length === 0) return <span className="text-gray-400">None</span>;
        return types.map((type) => CAMPAIGN_TYPE_LABELS[type] || type).join(', ');
    };

    const renderDiscountTypes = (types?: string[]) => {
        if (!types || types.length === 0) return <span className="text-gray-400">None</span>;
        return types.map((type) => DISCOUNT_TYPE_LABELS[type] || type).join(', ');
    };

    return (
        <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
            <div className="overflow-x-auto">
                <Table className="min-w-250">
                    <TableHeader>
                        <TableRow className="border-gray-200">
                            <TableHead className="w-25 pl-6 text-gray-600 font-semibold">Image</TableHead>
                            <TableHead className="text-gray-600 font-semibold">Product</TableHead>
                            <TableHead className="text-gray-600 font-semibold">Collections</TableHead>
                            <TableHead className="w-30 text-gray-600 font-semibold">Homepage</TableHead>
                            <TableHead className="w-30 text-gray-600 font-semibold">Price</TableHead>
                            <TableHead className="w-30 text-gray-600 font-semibold">Stock</TableHead>
                            <TableHead className="w-30 text-gray-600 font-semibold">Status</TableHead>
                            <TableHead className="w-30 text-gray-600 font-semibold">Campaign</TableHead>
                            <TableHead className="text-right pr-6 w-25 text-gray-600 font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className="border-gray-200 hover:bg-gray-50/50">
                                <TableCell className="pl-6">
                                    {product.assets && product.assets.length > 0 ? (
                                        <img
                                            src={getImageUrl(product.assets[0].asset.source)}
                                            alt={product.name}
                                            loading="lazy"
                                            decoding="async"
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 object-cover rounded shadow-sm border border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-50 border border-gray-200 border-dashed rounded flex items-center justify-center text-gray-300">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-gray-500">{product.slug}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-900">
                                        {product.collections && product.collections.length > 0
                                            ? product.collections.map((pc: any) => pc.collection.name).join(', ')
                                            : <span className="text-gray-400">None</span>
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {product.homepageCollections && product.homepageCollections.length > 0 ? (
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none px-2 py-0.5 text-[11px] font-medium">
                                            Yes
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-none px-2 py-0.5 text-[11px] font-medium">
                                            No
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm font-semibold text-gray-900">
                                    {getProductPrice(product)}
                                </TableCell>
                                <TableCell className="text-sm">
                                    <span className={product.stockOnHand <= 10 ? "text-primary-700 font-medium" : "text-gray-700"}>
                                        {product.stockOnHand ?? 0}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        className={`border-none px-2 py-0.5 text-[11px] font-medium ${product.enabled
                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {product.enabled ? 'Active' : 'Draft'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-700">
                                    <div className="space-y-1">
                                        <div>
                                            <span className="text-gray-500">Campaign Type:</span>{' '}
                                            {renderCampaignTypes(product.campaignTypes)}
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Discount Type:</span>{' '}
                                            {renderDiscountTypes(product.discountTypes)}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-1">
                                        <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary-50">
                                            <Link href={`/admin/products/${product.id}/edit`}>
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(product.id, product.name)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
