'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { getImageUrl } from '@/lib/image-utils';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Plus,
    Image as ImageIcon,
    MoreVertical,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface Banner {
    id: string;
    title: string;
    slug: string;
    position: string;
    enabled: boolean;
    sortOrder: number;
    createdAt: string;
    desktopImage?: { source: string; preview: string };
    mobileImage?: { source: string; preview: string };
    collection?: { id: string; name: string; slug: string };
}

interface GroupedBanners {
    [key: string]: Banner[];
}

const POSITION_LABELS: { [key: string]: string } = {
    HERO: 'Hero (Top Slider)',
    DEALS: 'Deals',
    DEALS_HORIZONTAL: 'Deals Horizontal',
    MIDDLE: 'Middle Section',
    BOTTOM: 'Bottom Section',
    COLLECTION_TOP: 'Collection Header'
};

const POSITION_ORDER = ['HERO', 'DEALS', 'DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM', 'COLLECTION_TOP'];

export default function BannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await fetch('/api/admin/marketing/banners');
            if (response.ok) {
                const data = await response.json();
                setBanners(data);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/marketing/banners/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setBanners(banners.filter((b) => b.id !== id));
                setOpenDropdown(null);
                toast({
                    title: 'Success',
                    description: 'Banner deleted successfully',
                    variant: 'success',
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to delete banner',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete banner',
                variant: 'error',
            });
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/marketing/banners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !currentStatus }),
            });

            if (response.ok) {
                const updatedBanner = await response.json();
                setBanners(banners.map(b => b.id === id ? { ...b, enabled: updatedBanner.enabled } : b));
                toast({
                    title: 'Success',
                    description: `Banner ${updatedBanner.enabled ? 'enabled' : 'disabled'} successfully`,
                    variant: 'success',
                });
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to update banner status',
                    variant: 'error',
                });
            }
        } catch (error) {
            console.error('Error updating banner status:', error);
            toast({
                title: 'Error',
                description: 'Failed to update banner status',
                variant: 'error',
            });
        }
    };

    const togglePosition = (position: string) => {
        const newExpanded = new Set(expandedPositions);
        if (newExpanded.has(position)) {
            newExpanded.delete(position);
        } else {
            newExpanded.add(position);
        }
        setExpandedPositions(newExpanded);
    };

    // Filter banners by search query
    const filteredBanners = banners.filter((banner) =>
        banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group banners by position
    const groupedBanners: GroupedBanners = filteredBanners.reduce((acc, banner) => {
        if (!acc[banner.position]) {
            acc[banner.position] = [];
        }
        acc[banner.position].push(banner);
        return acc;
    }, {} as GroupedBanners);

    // Sort banners within each group by sortOrder
    Object.keys(groupedBanners).forEach(position => {
        groupedBanners[position].sort((a, b) => a.sortOrder - b.sortOrder);
    });

    // Get positions in the correct order
    const orderedPositions = POSITION_ORDER.filter(pos => groupedBanners[pos]);

    const BannerRow = ({ banner, isFirst }: { banner: Banner; isFirst?: boolean }) => (
        <tr
            className={`hover:bg-gray-50 transition-colors ${!isFirst ? 'border-t border-gray-100' : ''}`}
        >
            <td className="px-6 py-4">
                <div className="h-12 w-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {banner.desktopImage ? (
                        <img
                            src={getImageUrl(banner.desktopImage.preview || banner.desktopImage.source)}
                            alt={banner.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                <div>
                    <div className="text-sm font-medium text-gray-900">
                        {banner.title}
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                        {banner.slug}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                {banner.collection ? (
                    <Link
                        href={`/admin/collections/${banner.collection.id}/edit`}
                        className="text-sm text-primary-800 hover:text-primary-900 hover:underline"
                    >
                        {banner.collection.name}
                    </Link>
                ) : (
                    <span className="text-sm text-gray-400">—</span>
                )}
            </td>
            <td className="px-6 py-4">
                <button
                    onClick={() => toggleStatus(banner.id, banner.enabled)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${banner.enabled
                        ? 'bg-primary-50 text-primary-700'
                        : 'bg-gray-100 text-gray-800'
                        }`}
                >
                    {banner.enabled ? 'Active' : 'Disabled'}
                </button>
            </td>
            <td className="px-6 py-4 text-sm text-gray-900">
                {banner.sortOrder}
            </td>
            <td className="px-6 py-4 text-right">
                <div className="relative">
                    <button
                        onClick={(e) => {
                            setOpenDropdown(
                                openDropdown === banner.id
                                    ? null
                                    : banner.id
                            );
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        id={`dropdown-btn-${banner.id}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {openDropdown === banner.id && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                            ></div>
                            <div className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                style={{
                                    top: `${document.getElementById(`dropdown-btn-${banner.id}`)?.getBoundingClientRect().bottom ?? 0}px`,
                                    right: `${window.innerWidth - (document.getElementById(`dropdown-btn-${banner.id}`)?.getBoundingClientRect().right ?? 0)}px`,
                                }}
                            >
                                <Link
                                    href={`/admin/marketing/banners/${banner.id}/edit`}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                    onClick={() => setOpenDropdown(null)}
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Banner
                                </Link>
                                <button
                                    onClick={() => {
                                        setOpenDropdown(null);
                                        toggleStatus(banner.id, banner.enabled);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    {banner.enabled ? (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            Disable
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            Enable
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() =>
                                        handleDelete(
                                            banner.id,
                                            banner.title
                                        )
                                    }
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Banner
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800"></div>
                    </div>
                </AdminLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Banners</h1>
                            <p className="text-gray-600">
                                Manage your storefront banners and promotions
                            </p>
                        </div>
                        <Link
                            href="/admin/marketing/banners/new"
                            className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                        >
                            <Plus className="w-5 h-5" />
                            Create Banner
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search banners..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Banners List - Grouped by Position */}
                    {filteredBanners.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="text-center py-12">
                                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No banners found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Create a banner to display on your storefront
                                </p>
                                <Link
                                    href="/admin/marketing/banners/new"
                                    className="inline-flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Banner
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orderedPositions.map((position) => {
                                const positionBanners = groupedBanners[position];
                                const isExpanded = expandedPositions.has(position);
                                const hasMultiple = positionBanners.length > 1;
                                const displayBanners = isExpanded ? positionBanners : [positionBanners[0]];

                                return (
                                    <div key={position} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                        {/* Position Header */}
                                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                                                    {POSITION_LABELS[position] || position}
                                                </h3>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {positionBanners.length} {positionBanners.length === 1 ? 'banner' : 'banners'}
                                                </span>
                                            </div>
                                            {hasMultiple && !isExpanded && (
                                                <button
                                                    onClick={() => togglePosition(position)}
                                                    className="text-sm text-primary-800 hover:text-primary-900 font-medium"
                                                >
                                                    Show {positionBanners.length - 1} more {positionBanners.length - 1 === 1 ? 'banner' : 'banners'}
                                                </button>
                                            )}
                                            {hasMultiple && isExpanded && (
                                                <button
                                                    onClick={() => togglePosition(position)}
                                                    className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                                                >
                                                    Show less
                                                </button>
                                            )}
                                        </div>

                                        {/* Banners Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Image
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Title / Slug
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Collection
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Sort Order
                                                        </th>
                                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {displayBanners.map((banner, index) => (
                                                        <BannerRow key={banner.id} banner={banner} isFirst={index === 0} />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
