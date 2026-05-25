'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, CheckCircle, XCircle, Loader2, History, Search, Database, ShoppingCart, AlertTriangle, Trash2, TrendingUp, Package } from 'lucide-react';
import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface CronJob {
    id: string;
    name: string;
    description: string;
    schedule: string;
    endpoint: string;
    enabled: boolean;
    icon: typeof Clock;
    category: 'marketing' | 'system' | 'search' | 'commerce';
    lastRun?: string;
    lastStatus?: 'success' | 'error';
    lastResult?: {
        count?: number;
        message?: string;
    };
}

interface ExecutionHistory {
    id: string;
    jobId: string;
    jobName: string;
    status: 'success' | 'error';
    timestamp: string;
    result: {
        count?: number;
        message?: string;
    };
    duration?: number;
}

const cronJobs: CronJob[] = [
    {
        id: 'abandoned-carts',
        name: 'Abandoned Carts',
        description: 'Mark carts as abandoned after 2 hours of inactivity',
        schedule: '0 * * * *',
        endpoint: '/api/admin/cron/abandoned-carts',
        enabled: true,
        icon: ShoppingCart,
        category: 'commerce',
    },

    {
        id: 'low-stock-alerts',
        name: 'Low Stock Alerts',
        description: 'Check for products with low stock and generate alerts',
        schedule: '0 9 * * *',
        endpoint: '/api/admin/cron/low-stock-alerts',
        enabled: true,
        icon: AlertTriangle,
        category: 'commerce',
    },
    {
        id: 'cleanup-data',
        name: 'Cleanup Old Data',
        description: 'Remove old abandoned carts and marketing emails',
        schedule: '0 2 * * *',
        endpoint: '/api/admin/cron/cleanup-old-data',
        enabled: true,
        icon: Trash2,
        category: 'system',
    },
    {
        id: 'daily-sales-report',
        name: 'Daily Sales Report',
        description: 'Generate daily sales statistics and revenue report',
        schedule: '0 0 * * *',
        endpoint: '/api/admin/cron/daily-sales-report',
        enabled: true,
        icon: TrendingUp,
        category: 'commerce',
    },
    {
        id: 'sync-inventory',
        name: 'Sync Inventory',
        description: 'Sync product inventory with external systems',
        schedule: '0 */6 * * *',
        endpoint: '/api/admin/cron/sync-inventory',
        enabled: true,
        icon: Package,
        category: 'commerce',
    },

    {
        id: 'typesense-reindex',
        name: 'Typesense Full Reindex',
        description: 'Reindex all products and collections in Typesense search',
        schedule: '0 */6 * * *',
        endpoint: '/api/admin/cron/typesense-reindex',
        enabled: true,
        icon: Database,
        category: 'search',
    },
    {
        id: 'typesense-sync-products',
        name: 'Typesense Sync Products',
        description: 'Sync published products to Typesense search index',
        schedule: '0 */6 * * *',
        endpoint: '/api/admin/cron/typesense-sync-products',
        enabled: true,
        icon: Search,
        category: 'search',
    },
    {
        id: 'typesense-sync-collections',
        name: 'Typesense Sync Collections',
        description: 'Sync collections to Typesense search index',
        schedule: '0 */6 * * *',
        endpoint: '/api/admin/cron/typesense-sync-collections',
        enabled: true,
        icon: Search,
        category: 'search',
    },
];

const categoryConfig = {
    marketing: { label: 'Marketing', color: 'text-purple-600', bg: 'bg-purple-50' },
    system: { label: 'System', color: 'text-gray-600', bg: 'bg-gray-50' },
    search: { label: 'Search', color: 'text-blue-600', bg: 'bg-blue-50' },
    commerce: { label: 'Commerce', color: 'text-green-600', bg: 'bg-green-50' },
};

const scheduleMap: Record<string, string> = {
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes',
    '*/30 * * * *': 'Every 30 minutes',
    '0 * * * *': 'Every hour',
    '0 */6 * * *': 'Every 6 hours',
    '0 0 * * *': 'Daily at midnight',
    '0 2 * * *': 'Daily at 2 AM',
    '0 9 * * *': 'Daily at 9 AM',
};

export default function CronJobsPage() {
    const [jobs, setJobs] = useState<CronJob[]>(cronJobs);
    const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
    const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const runJob = async (job: CronJob) => {
        setRunningJobs((prev) => new Set(prev).add(job.id));
        const startTime = Date.now();

        try {
            const response = await fetch(job.endpoint, {
                credentials: 'include',
            });
            const data = await response.json();
            const duration = Date.now() - startTime;

            const newExecution: ExecutionHistory = {
                id: `${job.id}-${Date.now()}`,
                jobId: job.id,
                jobName: job.name,
                status: response.ok ? 'success' : 'error',
                timestamp: new Date().toISOString(),
                result: data,
                duration,
            };

            setExecutionHistory((prev) => [newExecution, ...prev].slice(0, 50));

            setJobs((prevJobs) =>
                prevJobs.map((j) =>
                    j.id === job.id
                        ? {
                            ...j,
                            lastRun: new Date().toISOString(),
                            lastStatus: response.ok ? 'success' : 'error',
                            lastResult: data,
                        }
                        : j
                )
            );
        } catch (error) {
            const duration = Date.now() - startTime;
            const newExecution: ExecutionHistory = {
                id: `${job.id}-${Date.now()}`,
                jobId: job.id,
                jobName: job.name,
                status: 'error',
                timestamp: new Date().toISOString(),
                result: { message: 'Failed to execute job' },
                duration,
            };

            setExecutionHistory((prev) => [newExecution, ...prev].slice(0, 50));

            setJobs((prevJobs) =>
                prevJobs.map((j) =>
                    j.id === job.id
                        ? {
                            ...j,
                            lastRun: new Date().toISOString(),
                            lastStatus: 'error',
                            lastResult: { message: 'Failed to execute job' },
                        }
                        : j
                )
            );
        } finally {
            setRunningJobs((prev) => {
                const newSet = new Set(prev);
                newSet.delete(job.id);
                return newSet;
            });
        }
    };

    const formatLastRun = (lastRun?: string) => {
        if (!lastRun) return 'Never';
        const date = new Date(lastRun);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const categories = ['all', ...Object.keys(categoryConfig)];
    const filteredJobs = selectedCategory === 'all' ? jobs : jobs.filter(j => j.category === selectedCategory);

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Cron Jobs</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Manage and monitor scheduled background tasks</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {categories.map((cat) => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedCategory(cat)}
                                className={`h-8 text-xs ${selectedCategory === cat ? 'bg-primary-800 hover:bg-primary-900' : ''}`}
                            >
                                {cat === 'all' ? 'All' : categoryConfig[cat as keyof typeof categoryConfig]?.label || cat}
                            </Button>
                        ))}
                    </div>

                    <div className="bg-white rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[240px]">Job</TableHead>
                                    <TableHead className="w-[100px]">Category</TableHead>
                                    <TableHead className="w-[160px]">Schedule</TableHead>
                                    <TableHead className="w-[100px]">Last Run</TableHead>
                                    <TableHead className="w-[90px]">Status</TableHead>
                                    <TableHead className="w-[80px]">Duration</TableHead>
                                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => {
                                    const isRunning = runningJobs.has(job.id);
                                    const Icon = job.icon;
                                    const catConfig = categoryConfig[job.category];

                                    return (
                                        <TableRow key={job.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-md ${catConfig.bg}`}>
                                                        <Icon className={`w-4 h-4 ${catConfig.color}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm text-gray-900 truncate">{job.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{job.description}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs h-5 px-1.5">
                                                    {catConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm text-gray-900">{scheduleMap[job.schedule] || job.schedule}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{job.schedule}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatLastRun(job.lastRun)}
                                            </TableCell>
                                            <TableCell>
                                                {job.lastStatus ? (
                                                    <Badge variant={job.lastStatus === 'success' ? 'success' : 'outline'} className="text-xs h-5 px-1.5">
                                                        {job.lastStatus === 'success' ? (
                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                        )}
                                                        {job.lastStatus}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {executionHistory.find(e => e.jobId === job.id)?.duration ? formatDuration(executionHistory.find(e => e.jobId === job.id)?.duration) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => runJob(job)}
                                                    disabled={isRunning || !job.enabled}
                                                    className="h-7 text-xs"
                                                >
                                                    {isRunning ? (
                                                        <>
                                                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                                                            Running
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-3.5 h-3.5 mr-1" />
                                                            Run
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {executionHistory.length > 0 && (
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <History className="w-4 h-4 text-gray-500" />
                                    <h3 className="text-sm font-semibold text-gray-900">Execution History</h3>
                                    <Badge variant="outline" className="text-xs h-5 px-1.5 ml-auto">
                                        Last {executionHistory.length}
                                    </Badge>
                                </div>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Job</TableHead>
                                        <TableHead className="w-[80px]">Status</TableHead>
                                        <TableHead>Result</TableHead>
                                        <TableHead className="w-[80px]">Duration</TableHead>
                                        <TableHead className="w-[120px]">Executed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {executionHistory.slice(0, 10).map((execution) => (
                                        <TableRow key={execution.id}>
                                            <TableCell className="text-sm font-medium text-gray-900">
                                                {execution.jobName}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={execution.status === 'success' ? 'success' : 'outline'} className="text-xs h-5 px-1.5">
                                                    {execution.status === 'success' ? (
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                    )}
                                                    {execution.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {execution.result.message || `${execution.result.count || 0} items processed`}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatDuration(execution.duration)}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {formatLastRun(execution.timestamp)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
