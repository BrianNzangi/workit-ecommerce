'use client';

import { ProtectedRoute } from '@/components/login/ProtectedRoute';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Search, Filter, MoreVertical, Play, Copy, Download, Edit, Trash2, Type } from 'lucide-react';
import { useState } from 'react';

interface Segment {
    id: string;
    name: string;
    percentage: string;
    lastActivity: string;
    createdBy: string;
}

const defaultSegments: Segment[] = [
    {
        id: '1',
        name: 'Customers who have purchased at least once',
        percentage: '0%',
        lastActivity: 'Created at 6:57 pm',
        createdBy: 'Shopify',
    },
    {
        id: '2',
        name: 'Email subscribers',
        percentage: '0%',
        lastActivity: 'Created at 6:57 pm',
        createdBy: 'Shopify',
    },
    {
        id: '3',
        name: 'Abandoned checkouts in the last 30 days',
        percentage: '0%',
        lastActivity: 'Created at 6:57 pm',
        createdBy: 'Shopify',
    },
    {
        id: '4',
        name: 'Customers who have purchased more than once',
        percentage: '0%',
        lastActivity: 'Created at 6:57 pm',
        createdBy: 'Shopify',
    },
    {
        id: '5',
        name: "Customers who haven't purchased",
        percentage: '0%',
        lastActivity: 'Created at 6:57 pm',
        createdBy: 'Shopify',
    },
];

export default function SegmentsPage() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const toggleDropdown = (segmentId: string) => {
        setOpenDropdown(openDropdown === segmentId ? null : segmentId);
    };

    const handleAction = (action: string, segmentId: string) => {
        console.log(`Action: ${action} on segment: ${segmentId}`);
        setOpenDropdown(null);
    };

    return (
        <ProtectedRoute>
            <AdminLayout>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Segments</h1>
                    <p className="text-gray-600">Organize customers into groups based on their behavior</p>
                </div>

                {/* Search and Filter */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search segments"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xs focus:ring-2 focus:ring-[#FF5023] focus:border-transparent"
                        />
                    </div>
                    <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xs hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>

                {/* Segments Table */}
                <div className="bg-white rounded-xs shadow-xs border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023]"
                                            aria-label="Select all segments"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        % of customers
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Last activity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Created by
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {defaultSegments.map((segment) => (
                                    <tr
                                        key={segment.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-[#FF5023] border-gray-300 rounded focus:ring-[#FF5023]"
                                                aria-label={`Select segment ${segment.name}`}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                {segment.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">{segment.percentage}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-700">{segment.lastActivity}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-[#95BF47] rounded-sm flex items-center justify-center">
                                                    <span className="text-white text-xs font-bold">S</span>
                                                </div>
                                                <span className="text-sm text-gray-700">{segment.createdBy}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="relative inline-block">
                                                <button
                                                    onClick={() => toggleDropdown(segment.id)}
                                                    className="p-1 hover:bg-gray-100 rounded-xs transition-colors"
                                                    aria-label="Actions"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </button>

                                                {openDropdown === segment.id && (
                                                    <>
                                                        {/* Backdrop to close dropdown */}
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenDropdown(null)}
                                                        />

                                                        {/* Dropdown Menu */}
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xs shadow-lg border border-gray-200 py-1 z-20">
                                                            <button
                                                                onClick={() => handleAction('use', segment.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Play className="w-4 h-4" />
                                                                Use segment
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction('duplicate', segment.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                                Duplicate
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction('export', segment.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Export
                                                            </button>
                                                            <div className="border-t border-gray-200 my-1" />
                                                            <button
                                                                onClick={() => handleAction('rename', segment.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Type className="w-4 h-4" />
                                                                Rename
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction('edit', segment.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction('delete', segment.id)}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete
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

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {defaultSegments.length} segments
                        </p>
                    </div>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}
