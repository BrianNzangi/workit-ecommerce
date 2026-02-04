'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Plus,
    Search,
    Calendar,
    TrendingUp,
    Edit,
    Trash2,
    MoreVertical,
    Tag,
    DollarSign,
    Users,
    Mail,
} from 'lucide-react';
import { CampaignService, Campaign } from '@/lib/services';


const CAMPAIGN_TYPES: Record<string, string> = {
    SEASONAL: 'Seasonal',
    PROMOTIONAL: 'Promotional',
    PRODUCT_LAUNCH: 'Product Launch',
    HOLIDAY: 'Holiday',
    LOYALTY: 'Loyalty',
    RE_ENGAGEMENT: 'Re-engagement',
    OTHER: 'Other',
};

const CAMPAIGN_STATUSES: Record<string, string> = {
    DRAFT: 'Draft',
    SCHEDULED: 'Scheduled',
    ACTIVE: 'Active',
    COMPLETED: 'Completed',
    PAUSED: 'Paused',
    CANCELLED: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    ACTIVE: 'bg-primary-50 text-primary-700',
    COMPLETED: 'bg-green-100 text-green-800',
    PAUSED: 'bg-yellow-100 text-yellow-800',
    CANCELLED: 'bg-red-100 text-red-800',
};

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, [statusFilter, typeFilter]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const campaignService = new CampaignService();
            const data = await campaignService.getCampaigns({
                status: statusFilter,
                type: typeFilter,
            });
            setCampaigns(data);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            toast({
                title: 'Error',
                description: 'Failed to load campaigns',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            const campaignService = new CampaignService();
            await campaignService.deleteCampaign(id);

            setCampaigns(campaigns.filter((c) => c.id !== id));
            setOpenDropdown(null);
            toast({
                title: 'Success',
                description: 'Campaign deleted successfully',
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Error deleting campaign:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete campaign',
                variant: 'error',
            });
        }
    };

    const filteredCampaigns = campaigns.filter((campaign) =>
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(cents / 100);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

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
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                            <Link
                                href="/admin/marketing/campaigns/new"
                                className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                            >
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </Link>
                        </div>
                        <p className="text-gray-600">Manage your marketing campaigns and promotions</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search campaigns..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            >
                                <option value="">All Statuses</option>
                                {Object.entries(CAMPAIGN_STATUSES).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>

                            {/* Type Filter */}
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                {Object.entries(CAMPAIGN_TYPES).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Campaigns List */}
                    {filteredCampaigns.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery || statusFilter || typeFilter
                                    ? 'Try adjusting your filters'
                                    : 'Get started by creating your first campaign'}
                            </p>
                            <Link
                                href="/admin/marketing/campaigns/new"
                                className="inline-flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xs hover:bg-primary-900 transition-colors shadow-xs"
                            >
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredCampaigns.map((campaign) => (
                                <div
                                    key={campaign.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {campaign.name}
                                                </h3>
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[campaign.status]}`}
                                                >
                                                    {CAMPAIGN_STATUSES[campaign.status]}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {CAMPAIGN_TYPES[campaign.type]}
                                                </span>
                                            </div>

                                            {campaign.description && (
                                                <p className="text-sm text-gray-600 mb-4">{campaign.description}</p>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                {/* Period */}
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>
                                                        {formatDate(campaign.startDate)}
                                                        {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                                                    </span>
                                                </div>

                                                {/* Discount */}
                                                {campaign.discountType && campaign.discountValue && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Tag className="w-4 h-4" />
                                                        <span>
                                                            {campaign.discountType === 'PERCENTAGE'
                                                                ? `${campaign.discountValue}% off`
                                                                : formatCurrency(campaign.discountValue)}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Coupon Code */}
                                                {campaign.couponCode && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <DollarSign className="w-4 h-4" />
                                                        <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                            {campaign.couponCode}
                                                        </code>
                                                    </div>
                                                )}

                                                {/* Revenue */}
                                                {campaign.revenue > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <TrendingUp className="w-4 h-4" />
                                                        <span>{formatCurrency(campaign.revenue)}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            {campaign.emailsSent > 0 && (
                                                <div className="flex items-center gap-6 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{campaign.emailsSent.toLocaleString()} sent</span>
                                                    </div>
                                                    <div className="text-gray-600">
                                                        {campaign.emailsOpened.toLocaleString()} opened (
                                                        {campaign.emailsSent > 0
                                                            ? Math.round((campaign.emailsOpened / campaign.emailsSent) * 100)
                                                            : 0}
                                                        %)
                                                    </div>
                                                    <div className="text-gray-600">
                                                        {campaign.emailsClicked.toLocaleString()} clicked (
                                                        {campaign.emailsSent > 0
                                                            ? Math.round((campaign.emailsClicked / campaign.emailsSent) * 100)
                                                            : 0}
                                                        %)
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Users className="w-4 h-4" />
                                                        <span>{campaign.conversions} conversions</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="relative ml-4">
                                            <button
                                                onClick={() =>
                                                    setOpenDropdown(openDropdown === campaign.id ? null : campaign.id)
                                                }
                                                className="text-gray-400 hover:text-gray-600"
                                                id={`dropdown-btn-${campaign.id}`}
                                            >
                                                <MoreVertical className="w-5 h-5" />
                                            </button>

                                            {openDropdown === campaign.id && (
                                                <>
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setOpenDropdown(null)}
                                                    ></div>
                                                    <div
                                                        className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                                        style={{
                                                            top: `${document.getElementById(`dropdown-btn-${campaign.id}`)?.getBoundingClientRect().bottom ?? 0}px`,
                                                            right: `${window.innerWidth - (document.getElementById(`dropdown-btn-${campaign.id}`)?.getBoundingClientRect().right ?? 0)}px`,
                                                        }}
                                                    >
                                                        <Link
                                                            href={`/admin/marketing/campaigns/${campaign.id}/edit`}
                                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                                            onClick={() => setOpenDropdown(null)}
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit Campaign
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(campaign.id, campaign.name)}
                                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Delete Campaign
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
