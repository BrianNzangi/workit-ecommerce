import Link from 'next/link';
import { Edit, Trash2, Package, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getImageUrl } from '@/lib/shared/images/image-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Brand } from './types';

interface BrandsTableProps {
    brands: Brand[];
    onDelete: (brandId: string, brandName: string) => void;
}

export function BrandsTable({ brands, onDelete }: BrandsTableProps) {
    if (brands.length === 0) {
        return (
            <Card className="border-gray-200">
                <CardContent className="py-12 text-center">
                    <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">No brands found</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-gray-200">
            <CardContent className="p-0">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Brand</TableHead>
                            <TableHead className="w-32">Slug</TableHead>
                            <TableHead className="w-20 text-center">Products</TableHead>
                            <TableHead className="w-24 text-center">Featured Home</TableHead>
                            <TableHead className="w-28 text-center">Featured Collections</TableHead>
                            <TableHead className="w-20 text-center">Status</TableHead>
                            <TableHead className="w-24 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {brands.map((brand) => (
                            <TableRow key={brand.id} className="group">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        {brand.logoUrl ? (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">
                                                <img
                                                    src={getImageUrl(brand.logoUrl)}
                                                    alt={brand.name}
                                                    className="h-full w-full object-contain p-1"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-lg font-semibold text-gray-400">
                                                {brand.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-gray-900">
                                                {brand.name}
                                            </p>
                                            {brand.description && (
                                                <p className="truncate text-xs text-gray-500">
                                                    {brand.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <span className="font-mono text-xs text-gray-500">
                                        {brand.slug}
                                    </span>
                                </TableCell>

                                <TableCell className="text-center">
                                    <span className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                        {brand._count?.products || 0}
                                    </span>
                                </TableCell>

                                <TableCell className="text-center">
                                    {brand.showInHomepage ? (
                                        <Check className="mx-auto h-4 w-4 text-green-600" />
                                    ) : (
                                        <X className="mx-auto h-4 w-4 text-gray-300" />
                                    )}
                                </TableCell>

                                <TableCell className="text-center">
                                    {brand.brandCollections && brand.brandCollections.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                            <Check className="h-3 w-3" />
                                            {brand.brandCollections.length}
                                        </span>
                                    ) : (
                                        <X className="mx-auto h-4 w-4 text-gray-300" />
                                    )}
                                </TableCell>

                                <TableCell className="text-center">
                                    <Badge
                                        variant={brand.enabled ? 'success' : 'secondary'}
                                        className={`rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                            !brand.enabled ? 'bg-gray-100 text-gray-500' : ''
                                        }`}
                                    >
                                        {brand.enabled ? 'Active' : 'Inactive'}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-400 hover:text-primary-900 hover:bg-primary-50"
                                        >
                                            <Link href={`/admin/brands/${brand.id}/edit`}>
                                                <Edit className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onDelete(brand.id, brand.name)}
                                            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
