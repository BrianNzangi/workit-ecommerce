'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Edit, Eye, EyeOff, Image as ImageIcon, MoreHorizontal, Trash2, Pencil, Copy } from 'lucide-react';
import { BannerService, Banner } from '@/lib/services';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/shared/images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/Pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { POSITION_LABELS } from '@/lib/banner/constants';

const ITEMS_PER_PAGE = 10;

function BannersLoadingState() {
    return (
        <div className="rounded bg-white">
            <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-b-primary-900" />
            </div>
        </div>
    );
}

function BannersErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="rounded bg-red-50 py-12">
            <div className="flex flex-col items-center text-center">
                <p className="mb-4 text-sm font-medium text-red-700">{message}</p>
                <Button onClick={onRetry} size="sm" variant="outline" className="rounded border-red-300 text-red-700 hover:bg-red-100">
                    Retry
                </Button>
            </div>
        </div>
    );
}

function BannersEmptyState({ searchTerm }: { searchTerm: string }) {
    return (
        <div className="rounded bg-white py-16">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-50">
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                    {searchTerm ? 'No results found' : 'No banners yet'}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {searchTerm
                        ? `No banners match "${searchTerm}".`
                        : 'Create a banner to start managing storefront placements.'}
                </p>
            </div>
        </div>
    );
}

export function BannersList() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [positionFilter, setPositionFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedBanners, setSelectedBanners] = useState<Set<string>>(new Set());
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
        let result = banners;

        const normalized = searchTerm.trim().toLowerCase();
        if (normalized) {
            result = result.filter((banner) =>
                banner.title.toLowerCase().includes(normalized) ||
                banner.slug.toLowerCase().includes(normalized)
            );
        }

        if (positionFilter !== 'all') {
            result = result.filter((banner) => banner.position === positionFilter);
        }

        return result.sort((a, b) => {
            if (a.position !== b.position) return a.position.localeCompare(b.position);
            return a.sortOrder - b.sortOrder;
        });
    }, [banners, searchTerm, positionFilter]);

    const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedBanners = filteredBanners.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const uniquePositions = useMemo(() => {
        const positions = new Set(banners.map((b) => b.position));
        return Array.from(positions).sort();
    }, [banners]);

    const toggleSelectAll = () => {
        if (selectedBanners.size === paginatedBanners.length) {
            setSelectedBanners(new Set());
        } else {
            setSelectedBanners(new Set(paginatedBanners.map((b) => b.id)));
        }
    };

    const toggleSelect = (bannerId: string) => {
        const newSelected = new Set(selectedBanners);
        if (newSelected.has(bannerId)) {
            newSelected.delete(bannerId);
        } else {
            newSelected.add(bannerId);
        }
        setSelectedBanners(newSelected);
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
                description: `${deleteTarget.title} has been removed.`,
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
        <div>
            <div className="mb-4 flex items-center gap-3">
                <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-[140px] rounded bg-gray-50">
                        <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Positions</SelectItem>
                        {uniquePositions.map((position) => (
                            <SelectItem key={position} value={position}>
                                {POSITION_LABELS[position] || position}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="relative flex-1 max-w-sm">
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded bg-gray-50 pl-3 ring-1 ring-transparent transition-all focus:bg-white focus:ring-primary-900"
                    />
                </div>

                <div className="ml-auto flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {filteredBanners.length === 0 ? (
                <BannersEmptyState searchTerm={searchTerm} />
            ) : (
                <div className="rounded bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="w-12 px-4 py-3">
                                        <Checkbox
                                            checked={selectedBanners.size === paginatedBanners.length && paginatedBanners.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Image
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Banner
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Position
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Linked To
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Sort
                                    </th>
                                    <th className="w-32 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBanners.map((banner) => (
                                    <tr key={banner.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                                        <td className="px-4 py-3">
                                            <Checkbox
                                                checked={selectedBanners.has(banner.id)}
                                                onCheckedChange={() => toggleSelect(banner.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex h-10 w-16 items-center justify-center overflow-hidden rounded bg-gray-50">
                                                {banner.desktopImage ? (
                                                    <img
                                                        src={getImageUrl(banner.desktopImage.preview || banner.desktopImage.source || '')}
                                                        alt={banner.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImageIcon className="h-4 w-4 text-gray-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{banner.title}</p>
                                                <p className="text-xs text-gray-400">{banner.slug}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="rounded bg-gray-100 text-gray-600">
                                                {POSITION_LABELS[banner.position] || banner.position}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {banner.collection ? (
                                                <Link
                                                    href={`/admin/collections/${banner.collection.id}/edit`}
                                                    className="text-primary-700 hover:underline"
                                                >
                                                    {banner.collection.name}
                                                </Link>
                                            ) : banner.product ? (
                                                <Link
                                                    href={`/admin/products/${banner.product.id}/edit`}
                                                    className="text-primary-700 hover:underline"
                                                >
                                                    {banner.product.name}
                                                </Link>
                                            ) : banner.campaign ? (
                                                <Link
                                                    href={`/admin/marketing/campaigns/${banner.campaign.id}/edit`}
                                                    className="text-primary-700 hover:underline"
                                                >
                                                    {banner.campaign.name}
                                                </Link>
                                            ) : banner.promotionId ? (
                                                <span className="text-primary-700">Promotion linked</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleStatus(banner)}
                                                className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                                                    banner.enabled
                                                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                            >
                                                {banner.enabled ? (
                                                    <>
                                                        <Eye className="h-3 w-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="h-3 w-3" />
                                                        Disabled
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm text-gray-700">
                                            {banner.sortOrder}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
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
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredBanners.length}
                        itemsPerPage={ITEMS_PER_PAGE}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent className="max-w-md rounded">
                    <DialogHeader>
                        <DialogTitle>Delete banner?</DialogTitle>
                        <DialogDescription>
                            {deleteTarget
                                ? `This will permanently delete "${deleteTarget.title}". This action cannot be undone.`
                                : 'This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="rounded bg-red-600 text-white hover:bg-red-700"
                        >
                            {deleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
