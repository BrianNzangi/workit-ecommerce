'use client';

import { useState, useEffect } from 'react';
import {
    Eye,
    TrendingUp,
    TrendingDown,
    Calendar,
    Search,
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductView {
    productId: string;
    viewCount: number;
    productName: string;
    productSlug: string;
    productImage: string | null;
}

interface TrendPoint {
    date: string;
    count: number;
}

export default function ProductViewsPage() {
    const [views, setViews] = useState<ProductView[]>([]);
    const [trend, setTrend] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [search, setSearch] = useState('');

    useEffect(() => {
        Promise.all([
            fetch(`/api/admin/analytics/product-views?days=${days}&limit=50`).then((r) => r.json()),
            fetch(`/api/admin/analytics/product-views/trend?days=${days}`).then((r) => r.json()),
        ]).then(([viewsData, trendData]) => {
            setViews(viewsData?.views || []);
            setTrend(trendData?.trend || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, [days]);

    const filteredViews = views.filter((v) =>
        v.productName.toLowerCase().includes(search.toLowerCase())
    );

    const totalViews = views.reduce((sum, v) => sum + v.viewCount, 0);
    const maxViews = views.length > 0 ? views[0].viewCount : 0;
    const trendMax = trend.length > 0 ? Math.max(...trend.map((t) => t.count)) : 0;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
                            <CardContent><Skeleton className="h-8 w-16" /></CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardContent className="p-6">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Views</CardTitle>
                        <Eye className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Last {days} days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Products Viewed</CardTitle>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{views.length}</div>
                        <p className="text-xs text-gray-500 mt-1">Unique products</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Views/Product</CardTitle>
                        <TrendingDown className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {views.length > 0 ? Math.round(totalViews / views.length).toLocaleString() : 0}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Per product</p>
                    </CardContent>
                </Card>
            </div>

            {/* Date Filter */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                    />
                </div>
            </div>

            {/* Trend Chart */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">View Trend</CardTitle>
                </CardHeader>
                <CardContent>
                    {trend.length > 0 ? (
                        <div className="h-48 flex items-end gap-1">
                            {trend.map((point) => {
                                const height = trendMax > 0 ? (point.count / trendMax) * 100 : 0;
                                return (
                                    <div
                                        key={point.date}
                                        className="flex-1 flex flex-col items-center gap-1 group relative"
                                    >
                                        <div
                                            className="w-full bg-[#FF5023] rounded-t hover:opacity-80 transition-opacity min-h-[4px]"
                                            style={{ height: `${Math.max(height, 2)}%` }}
                                        />
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {point.count.toLocaleString()} views
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                            No view data available for this period
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-gray-600">Product Views</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead>% of Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredViews.length > 0 ? (
                                filteredViews.map((product) => {
                                    const pct = totalViews > 0
                                        ? ((product.viewCount / totalViews) * 100).toFixed(1)
                                        : '0';
                                    return (
                                        <TableRow key={product.productId}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {product.productImage ? (
                                                        <img
                                                            src={product.productImage}
                                                            alt={product.productName}
                                                            className="w-10 h-10 rounded object-cover bg-gray-100"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
                                                            <Eye className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {product.productName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {product.productSlug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="default" className="font-mono">
                                                        {product.viewCount.toLocaleString()}
                                                    </Badge>
                                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-[#FF5023] rounded-full"
                                                            style={{
                                                                width: `${maxViews > 0 ? (product.viewCount / maxViews) * 100 : 0}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {pct}%
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                                        <Eye className="w-8 h-8 mx-auto mb-2" />
                                        <p>No product views recorded yet</p>
                                        <p className="text-xs mt-1">
                                            Views are tracked when customers visit product pages
                                        </p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
