'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Edit,
    Eye,
    Mail,
    MoreVertical,
    Plus,
    Send,
    Tag,
    Trash2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Campaign, CampaignService } from '@/lib/services';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CAMPAIGN_STATUS_OPTIONS, CAMPAIGN_TYPE_OPTIONS } from './campaign.constants';
import { formatKesMinor } from './campaign.utils';

const statusVariantMap: Record<string, 'secondary' | 'info' | 'success' | 'warning' | 'error'> = {
    DRAFT: 'secondary',
    SCHEDULED: 'info',
    ACTIVE: 'success',
    COMPLETED: 'secondary',
    PAUSED: 'warning',
    CANCELLED: 'error',
};

const formatDate = (dateValue?: string | null) => {
    if (!dateValue) return '-';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-KE', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export function CampaignsList() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const service = new CampaignService();
            const data = await service.getCampaigns({
                q: searchQuery.trim() || undefined,
                status: statusFilter || undefined,
                type: typeFilter || undefined,
            });
            setCampaigns(data);
        } catch (error: any) {
            toast({
                title: 'Load failed',
                description: error?.message || 'Failed to load campaigns.',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchCampaigns();
        }, 250);

        return () => clearTimeout(timeout);
    }, [searchQuery, statusFilter, typeFilter]);

    const handleDelete = async (campaign: Campaign) => {
        if (!confirm(`Delete campaign "${campaign.name}"?`)) return;

        try {
            const service = new CampaignService();
            await service.deleteCampaign(campaign.id);
            setCampaigns((previous) => previous.filter((item) => item.id !== campaign.id));
            toast({
                title: 'Campaign deleted',
                description: `${campaign.name} has been removed.`,
                variant: 'success',
            });
        } catch (error: any) {
            toast({
                title: 'Delete failed',
                description: error?.message || 'Could not delete campaign.',
                variant: 'error',
            });
        }
    };

    const handleSendNow = async (campaign: Campaign) => {
        try {
            setSendingCampaignId(campaign.id);
            const service = new CampaignService();
            const { dispatch } = await service.sendCampaign(campaign.id, { channel: 'EMAIL' });
            toast({
                title: 'Campaign queued',
                description: dispatch?.message || 'Campaign send request queued.',
                variant: 'success',
            });
            fetchCampaigns();
        } catch (error: any) {
            toast({
                title: 'Send failed',
                description: error?.message || 'Could not queue campaign send.',
                variant: 'error',
            });
        } finally {
            setSendingCampaignId(null);
        }
    };

    const handleFetchPayload = async (campaign: Campaign) => {
        try {
            const service = new CampaignService();
            const data = await service.getCampaignSendPayload(campaign.id);
            toast({
                title: 'Payload fetched',
                description: `${data.payload.featuredProducts.length} products ready for send.`,
                variant: 'success',
            });
            console.log('Campaign send payload:', data.payload);
        } catch (error: any) {
            toast({
                title: 'Payload fetch failed',
                description: error?.message || 'Could not fetch campaign payload.',
                variant: 'error',
            });
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage campaign schedules, discounts, featured products, and send payloads.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/admin/marketing/campaigns/new">
                        <Plus className="h-4 w-4" />
                        Create Campaign
                    </Link>
                </Button>
            </div>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filters</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Input
                        placeholder="Search campaigns..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    <Select
                        value={statusFilter || '__all__'}
                        onValueChange={(value) => setStatusFilter(value === '__all__' ? '' : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All statuses</SelectItem>
                            {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select
                        value={typeFilter || '__all__'}
                        onValueChange={(value) => setTypeFilter(value === '__all__' ? '' : value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All campaign types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="__all__">All campaign types</SelectItem>
                            {CAMPAIGN_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Revenue</TableHead>
                                <TableHead className="w-20" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-sm text-muted-foreground">
                                        Loading campaigns...
                                    </TableCell>
                                </TableRow>
                            ) : campaigns.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="py-10 text-center">
                                            <p className="text-sm text-muted-foreground">No campaigns found.</p>
                                            <Button asChild className="mt-4">
                                                <Link href="/admin/marketing/campaigns/new">
                                                    <Plus className="h-4 w-4" />
                                                    Create Campaign
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : campaigns.map((campaign) => (
                                <TableRow key={campaign.id}>
                                    <TableCell>
                                        <div className="font-medium">{campaign.name}</div>
                                        <div className="text-xs text-muted-foreground">{campaign.slug}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariantMap[campaign.status] || 'secondary'}>
                                            {campaign.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {formatDate(campaign.startDate)}
                                                {campaign.endDate ? ` - ${formatDate(campaign.endDate)}` : ''}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {campaign.discountType && campaign.discountType !== 'NONE' ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Tag className="h-4 w-4 text-muted-foreground" />
                                                <span>
                                                    {campaign.discountType === 'PERCENTAGE'
                                                        ? `${campaign.discountValue || 0}%`
                                                        : campaign.discountType === 'FREE_SHIPPING'
                                                            ? 'Free Shipping'
                                                            : campaign.discountType === 'BUY_X_GET_Y'
                                                                ? `Buy ${campaign.minPurchaseAmount || 0} Get ${campaign.discountValue || 0}`
                                                                : formatKesMinor(campaign.discountValue)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">No discount</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{campaign.featuredProductsCount || campaign.productIds.length}</TableCell>
                                    <TableCell>{formatKesMinor(campaign.revenue || 0)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/marketing/campaigns/${campaign.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleFetchPayload(campaign)}>
                                                    <Eye className="h-4 w-4" />
                                                    Fetch Send Payload
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleSendNow(campaign)}
                                                    disabled={sendingCampaignId === campaign.id}
                                                >
                                                    <Send className="h-4 w-4" />
                                                    {sendingCampaignId === campaign.id ? 'Sending...' : 'Send Now'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(campaign)} variant="destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
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

            {campaigns.some((campaign) => campaign.emailsSent > 0) ? (
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {campaigns.slice(0, 3).map((campaign) => (
                        <Card key={`${campaign.id}-stats`}>
                            <CardContent className="pt-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="text-sm font-medium">{campaign.name}</p>
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {campaign.emailsSent.toLocaleString()} sent / {campaign.emailsOpened.toLocaleString()} opened / {campaign.emailsClicked.toLocaleString()} clicked
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
