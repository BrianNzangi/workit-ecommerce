'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ChevronDown,
    ChevronRight,
    Edit,
    Eye,
    EyeOff,
    Image as ImageIcon,
    MoreHorizontal,
    Search,
    Trash2,
} from 'lucide-react';
import { BannerService, Banner } from '@/lib/services';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { POSITION_LABELS, POSITION_ORDER } from './banner.constants';

interface GroupedBanners {
    [key: string]: Banner[];
}

function BannersLoadingState() {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="flex min-h-[280px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-200 border-b-primary-900" />
            </CardContent>
        </Card>
    );
}

function BannersErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <Card className="border-red-200 bg-red-50 shadow-none">
            <CardContent className="flex flex-col items-start gap-3 p-4">
                <p className="text-sm font-semibold text-red-700">{message}</p>
                <Button onClick={onRetry} size="sm" className="bg-primary-900 text-white hover:bg-primary-800">
                    Retry
                </Button>
            </CardContent>
        </Card>
    );
}

function BannersEmptyState({ searchTerm }: { searchTerm: string }) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="flex min-h-[280px] flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-900">
                    <ImageIcon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-black tracking-tight text-secondary-900">No banners found</h3>
                <p className="mt-1 text-sm font-medium text-secondary-500">
                    {searchTerm
                        ? `No results for "${searchTerm}".`
                        : 'Create a banner to start managing storefront placements.'}
                </p>
            </CardContent>
        </Card>
    );
}

export function BannersList() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            setError(null);
            const bannerService = new BannerService();
            const data = await bannerService.getBanners();
            setBanners(data);
        } catch (fetchError: any) {
            console.error('Error fetching banners:', fetchError);
            setError(fetchError?.message || 'Failed to load banners.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const filteredBanners = useMemo(() => {
        const normalized = searchTerm.trim().toLowerCase();
        if (!normalized) return banners;
        return banners.filter((banner) =>
            banner.name.toLowerCase().includes(normalized) ||
            banner.slug.toLowerCase().includes(normalized)
        );
    }, [banners, searchTerm]);

    const groupedBanners = useMemo(() => {
        const grouped = filteredBanners.reduce((accumulator, banner) => {
            if (!accumulator[banner.position]) {
                accumulator[banner.position] = [];
            }
            accumulator[banner.position].push(banner);
            return accumulator;
        }, {} as GroupedBanners);

        Object.keys(grouped).forEach((position) => {
            grouped[position].sort((a, b) => a.sortOrder - b.sortOrder);
        });

        return grouped;
    }, [filteredBanners]);

    const orderedPositions = useMemo(() => {
        const known = POSITION_ORDER.filter((position) => groupedBanners[position]);
        const unknown = Object.keys(groupedBanners).filter((position) => !POSITION_ORDER.includes(position));
        return [...known, ...unknown];
    }, [groupedBanners]);

    const togglePosition = (position: string) => {
        setExpandedPositions((previous) => {
            const next = new Set(previous);
            if (next.has(position)) {
                next.delete(position);
            } else {
                next.add(position);
            }
            return next;
        });
    };

    const toggleStatus = async (banner: Banner) => {
        try {
            const bannerService = new BannerService();
            const updated = await bannerService.updateBanner(banner.id, { enabled: !banner.enabled });

            setBanners((previous) => previous.map((item) => (
                item.id === banner.id ? { ...item, enabled: updated.enabled } : item
            )));

            toast({
                title: 'Banner updated',
                description: `Banner ${updated.enabled ? 'enabled' : 'disabled'} successfully.`,
                variant: 'success',
            });
        } catch (toggleError: any) {
            toast({
                title: 'Update failed',
                description: toggleError?.message || 'Failed to update banner status.',
                variant: 'error',
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const bannerService = new BannerService();
            await bannerService.deleteBanner(deleteTarget.id);
            setBanners((previous) => previous.filter((item) => item.id !== deleteTarget.id));
            toast({
                title: 'Banner deleted',
                description: `${deleteTarget.name} has been removed.`,
                variant: 'success',
            });
            setDeleteTarget(null);
        } catch (deleteError: any) {
            toast({
                title: 'Delete failed',
                description: deleteError?.message || 'Failed to delete banner.',
                variant: 'error',
            });
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return <BannersLoadingState />;
    }

    if (error) {
        return <BannersErrorState message={error} onRetry={fetchBanners} />;
    }

    return (
        <div className="space-y-4">
            <Card className="border-gray-200 shadow-xs">
                <CardHeader className="p-4">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search banners by name or slug..."
                            className="border-gray-200 pl-9 focus-visible:ring-primary-200"
                        />
                    </div>
                </CardHeader>
            </Card>

            {filteredBanners.length === 0 ? (
                <BannersEmptyState searchTerm={searchTerm} />
            ) : (
                <div className="space-y-4">
                    {orderedPositions.map((position) => {
                        const positionBanners = groupedBanners[position];
                        const isExpanded = expandedPositions.has(position);
                        const hasMultiple = positionBanners.length > 1;
                        const displayed = isExpanded ? positionBanners : [positionBanners[0]];

                        return (
                            <Card key={position} className="overflow-hidden border-gray-200 shadow-xs">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3">
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-secondary-500">
                                            {POSITION_LABELS[position] || position}
                                        </h3>
                                        <Badge variant="info" className="text-[10px] font-black uppercase tracking-wider">
                                            {positionBanners.length} {positionBanners.length === 1 ? 'banner' : 'banners'}
                                        </Badge>
                                    </div>

                                    {hasMultiple ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => togglePosition(position)}
                                            className="h-8 gap-1 text-primary-900 hover:bg-primary-50 hover:text-primary-900"
                                        >
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            {isExpanded
                                                ? 'Show less'
                                                : `Show ${positionBanners.length - 1} more`}
                                        </Button>
                                    ) : null}
                                </CardHeader>

                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-gray-50/60">
                                            <TableRow>
                                                <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                                    Image
                                                </TableHead>
                                                <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                                    Banner
                                                </TableHead>
                                                <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                                    Collection
                                                </TableHead>
                                                <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                                    Status
                                                </TableHead>
                                                <TableHead className="px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400">
                                                    Sort
                                                </TableHead>
                                                <TableHead className="px-5 py-3 text-right text-xs font-black uppercase tracking-widest text-gray-400">
                                                    Actions
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {displayed.map((banner) => (
                                                <TableRow key={banner.id}>
                                                    <TableCell className="px-5 py-4">
                                                        <div className="flex h-12 w-20 items-center justify-center overflow-hidden rounded-xs border border-gray-200 bg-gray-100">
                                                            {banner.desktopImage ? (
                                                                <img
                                                                    src={getImageUrl(banner.desktopImage.preview || banner.desktopImage.source || '')}
                                                                    alt={banner.name}
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-secondary-400" />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        <p className="text-sm font-black text-secondary-900">{banner.name}</p>
                                                        <p className="text-xs font-semibold text-secondary-400">{banner.slug}</p>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        {banner.collection ? (
                                                            <Link
                                                                href={`/admin/collections/${banner.collection.id}/edit`}
                                                                className="text-sm font-semibold text-primary-900 hover:underline"
                                                            >
                                                                {banner.collection.name}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm font-medium text-secondary-400">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleStatus(banner)}
                                                            className={banner.enabled
                                                                ? 'h-7 border-primary-200 bg-primary-50 text-primary-900 hover:bg-primary-100'
                                                                : 'h-7 border-gray-200 bg-gray-50 text-secondary-600 hover:bg-gray-100'}
                                                        >
                                                            {banner.enabled ? 'Active' : 'Disabled'}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-sm font-semibold text-secondary-700">
                                                        {banner.sortOrder}
                                                    </TableCell>
                                                    <TableCell className="px-5 py-4 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-44">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/admin/marketing/banners/${banner.id}/edit`}>
                                                                        <Edit className="h-4 w-4" />
                                                                        Edit Banner
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => toggleStatus(banner)}>
                                                                    {banner.enabled ? (
                                                                        <>
                                                                            <EyeOff className="h-4 w-4" />
                                                                            Disable
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Eye className="h-4 w-4" />
                                                                            Enable
                                                                        </>
                                                                    )}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-700 focus:bg-red-50 focus:text-red-700"
                                                                    onClick={() => setDeleteTarget(banner)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                    Delete Banner
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete banner?</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `This will permanently delete "${deleteTarget.name}". This action cannot be undone.`
                                : 'This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
