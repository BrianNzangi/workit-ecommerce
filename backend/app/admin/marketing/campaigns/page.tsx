'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
    Plus,
    Mail,
    Calendar,
    Users,
    TrendingUp,
    MoreVertical,
    Search,
    Filter,
    Edit,
    Trash2,
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    subject: string;
    status: 'draft' | 'scheduled' | 'sent' | 'active';
    recipients: number;
    openRate: number;
    clickRate: number;
    sentAt?: Date;
    scheduledAt?: Date;
    createdAt: Date;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const response = await fetch('/api/admin/marketing/campaigns');
            if (response.ok) {
                const data = await response.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'sent':
                return 'bg-blue-100 text-blue-800';
            case 'scheduled':
                return 'bg-yellow-100 text-yellow-800';
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/marketing/campaigns/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setCampaigns(campaigns.filter((c) => c.id !== id));
                setOpenDropdown(null);
            } else {
                alert('Failed to delete campaign');
            }
        } catch (error) {
            console.error('Error deleting campaign:', error);
            alert('Failed to delete campaign');
        }
    };

    const filteredCampaigns = campaigns.filter((campaign) => {
        const matchesSearch =
            campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
            filterStatus === 'all' || campaign.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <ProtectedRoute>
                <AdminLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF5023]"></div>
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
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Campaigns</h1>
                            <p className="text-gray-600">
                                Create and manage your email marketing campaigns
                            </p>
                        </div>
                        <Link
                            href="/admin/marketing/campaigns/new"
                            className="flex items-center gap-2 bg-[#FF5023] text-white px-4 py-2 rounded-lg hover:bg-[#E64519] transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Campaign
                        </Link>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search campaigns..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="sent">Sent</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Campaigns List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        {filteredCampaigns.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No campaigns found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Get started by creating your first email campaign
                                </p>
                                <Link
                                    href="/admin/marketing/campaigns/new"
                                    className="inline-flex items-center gap-2 bg-[#FF5023] text-white px-4 py-2 rounded-lg hover:bg-[#E64519] transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create Campaign
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Campaign
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Recipients
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Open Rate
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Click Rate
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCampaigns.map((campaign) => (
                                            <tr
                                                key={campaign.id}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {campaign.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {campaign.subject}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                            campaign.status
                                                        )}`}
                                                    >
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {campaign.recipients.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {campaign.openRate.toFixed(1)}%
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {campaign.clickRate.toFixed(1)}%
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {campaign.sentAt
                                                        ? new Date(campaign.sentAt).toLocaleDateString()
                                                        : campaign.scheduledAt
                                                            ? `Scheduled: ${new Date(
                                                                campaign.scheduledAt
                                                            ).toLocaleDateString()}`
                                                            : new Date(
                                                                campaign.createdAt
                                                            ).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() =>
                                                                setOpenDropdown(
                                                                    openDropdown === campaign.id
                                                                        ? null
                                                                        : campaign.id
                                                                )
                                                            }
                                                            className="text-gray-400 hover:text-gray-600"
                                                        >
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>

                                                        {/* Dropdown Menu */}
                                                        {openDropdown === campaign.id && (
                                                            <>
                                                                {/* Backdrop to close dropdown when clicking outside */}
                                                                <div
                                                                    className="fixed inset-0 z-10"
                                                                    onClick={() => setOpenDropdown(null)}
                                                                ></div>

                                                                {/* Dropdown content */}
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                                                    <Link
                                                                        href={`/admin/marketing/campaigns/${campaign.id}/edit`}
                                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                                                                        onClick={() => setOpenDropdown(null)}
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                        Edit Campaign
                                                                    </Link>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                campaign.id,
                                                                                campaign.name
                                                                            )
                                                                        }
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                        Delete Campaign
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
