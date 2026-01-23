'use client';

import { useState } from 'react';
import { Clock, Play, CheckCircle, XCircle, Loader2, RefreshCw, History } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface CronJob {
    id: string;
    name: string;
    description: string;
    schedule: string;
    endpoint: string;
    enabled: boolean;
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

export default function CronJobsPage() {
    const [jobs, setJobs] = useState<CronJob[]>([
        {
            id: 'abandoned-carts',
            name: 'Abandoned Carts',
            description: 'Mark carts as abandoned after 2 hours of inactivity',
            schedule: '0 * * * *',
            endpoint: '/api/cron/abandoned-carts',
            enabled: true,
        },
        {
            id: 'send-campaigns',
            name: 'Send Scheduled Campaigns',
            description: 'Send marketing campaigns that are scheduled to be sent',
            schedule: '*/15 * * * *',
            endpoint: '/api/cron/send-campaigns',
            enabled: true,
        },
        {
            id: 'update-analytics',
            name: 'Update Campaign Analytics',
            description: 'Calculate and update campaign open rates and click rates',
            schedule: '*/30 * * * *',
            endpoint: '/api/cron/update-campaign-analytics',
            enabled: true,
        },
        {
            id: 'low-stock-alerts',
            name: 'Low Stock Alerts',
            description: 'Check for products with low stock and generate alerts',
            schedule: '0 9 * * *',
            endpoint: '/api/cron/low-stock-alerts',
            enabled: true,
        },
        {
            id: 'cleanup-data',
            name: 'Cleanup Old Data',
            description: 'Remove old abandoned carts and marketing emails',
            schedule: '0 2 * * *',
            endpoint: '/api/cron/cleanup-old-data',
            enabled: true,
        },
        {
            id: 'daily-sales-report',
            name: 'Daily Sales Report',
            description: 'Generate daily sales statistics and revenue report',
            schedule: '0 0 * * *',
            endpoint: '/api/cron/daily-sales-report',
            enabled: true,
        },
        {
            id: 'sync-inventory',
            name: 'Sync Inventory',
            description: 'Sync product inventory with external systems',
            schedule: '0 */6 * * *',
            endpoint: '/api/cron/sync-inventory',
            enabled: true,
        },
        {
            id: 'process-automations',
            name: 'Process Marketing Automations',
            description: 'Trigger automated marketing emails based on customer behavior',
            schedule: '*/5 * * * *',
            endpoint: '/api/cron/process-automations',
            enabled: true,
        },
    ]);
    const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());
    const [executionHistory, setExecutionHistory] = useState<ExecutionHistory[]>([]);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const runJob = async (job: CronJob) => {
        setRunningJobs((prev) => new Set(prev).add(job.id));
        const startTime = Date.now();

        try {
            const response = await fetch(job.endpoint);
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

    const formatSchedule = (schedule: string) => {
        const scheduleMap: { [key: string]: string } = {
            '*/5 * * * *': 'Every 5 minutes',
            '*/15 * * * *': 'Every 15 minutes',
            '*/30 * * * *': 'Every 30 minutes',
            '0 * * * *': 'Every hour',
            '0 */6 * * *': 'Every 6 hours',
            '0 0 * * *': 'Daily at midnight',
            '0 2 * * *': 'Daily at 2 AM',
            '0 9 * * *': 'Daily at 9 AM',
        };
        return scheduleMap[schedule] || schedule;
    };

    const formatLastRun = (lastRun?: string) => {
        if (!lastRun) return 'Never';
        const date = new Date(lastRun);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return date.toLocaleString();
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return 'N/A';
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Cron Jobs</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Manage and monitor scheduled background tasks
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <RefreshCw className="w-4 h-4" />
                                <span>Last updated: {formatLastRun(lastRefresh.toISOString())}</span>
                            </div>
                        </div>
                    </div>

                    {/* Jobs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {jobs.map((job) => {
                            const isRunning = runningJobs.has(job.id);

                            return (
                                <div
                                    key={job.id}
                                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                                >
                                    {/* Job Header */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                                            <Clock className="w-5 h-5 text-[#FF5023]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                                                {job.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2">{job.description}</p>
                                        </div>
                                    </div>

                                    {/* Job Details - Single Horizontal Row */}
                                    <div className="mb-3 pb-3 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500">Schedule:</span>
                                                <span className="font-medium text-gray-900">{formatSchedule(job.schedule)}</span>
                                            </div>
                                            <span className="text-gray-400">({job.schedule})</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-500">Last Run:</span>
                                                <span className="font-medium text-gray-900">{formatLastRun(job.lastRun)}</span>
                                            </div>
                                            <span
                                                className={`
                                                    inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium
                                                    ${job.enabled
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : 'bg-gray-50 text-gray-700 border border-gray-200'
                                                    }
                                                `}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${job.enabled ? 'bg-green-600' : 'bg-gray-400'}`} />
                                                {job.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Last Result */}
                                    {job.lastResult && (
                                        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                                            <div className="flex items-center gap-1.5">
                                                {job.lastStatus === 'success' ? (
                                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                                )}
                                                <p className="text-gray-700 line-clamp-2">
                                                    {job.lastResult.message ||
                                                        `Marked ${job.lastResult.count || 0} cart${job.lastResult.count !== 1 ? 's' : ''
                                                        } as abandoned`}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Button */}
                                    <button
                                        onClick={() => runJob(job)}
                                        disabled={isRunning || !job.enabled}
                                        className={`
                                            w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-colors
                                            ${isRunning
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : job.enabled
                                                    ? 'bg-[#FF5023] text-white hover:bg-[#E64519]'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {isRunning ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Running...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-4 h-4" />
                                                Run Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Execution History Table */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-700" />
                                <h2 className="text-lg font-semibold text-gray-900">Execution History</h2>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Recent cron job executions (last 50)</p>
                        </div>

                        {executionHistory.length === 0 ? (
                            <div className="p-8 text-center">
                                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No execution history yet</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Run a job manually or wait for scheduled execution
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Job Name
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Result
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Executed At
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {executionHistory.map((execution) => (
                                            <tr key={execution.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                    {execution.jobName}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                          ${execution.status === 'success'
                                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                                : 'bg-red-50 text-red-700 border border-red-200'
                                                            }
                        `}
                                                    >
                                                        {execution.status === 'success' ? (
                                                            <CheckCircle className="w-3 h-3" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3" />
                                                        )}
                                                        {execution.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {execution.result.message ||
                                                        `${execution.result.count || 0} cart${execution.result.count !== 1 ? 's' : ''
                                                        } marked`}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {formatDuration(execution.duration)}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {formatLastRun(execution.timestamp)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex gap-3">
                            <div className="shrink-0">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-1">About Cron Jobs</h4>
                                <p className="text-sm text-blue-700">
                                    Cron jobs are automated tasks that run on a schedule. These jobs are managed by the
                                    server's cron daemon on your VPS. You can manually trigger any job using the "Run
                                    Now" button for testing purposes. In production, configure your VPS cron to call the
                                    job endpoints at the specified intervals.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
