'use client';

import { Tag } from 'lucide-react';
import type { ClearanceDeal } from '@/lib/homepage/homepage-data';

interface ClearanceDealsSectionProps {
    deals: ClearanceDeal[];
}

export default function ClearanceDealsSection({ deals }: ClearanceDealsSectionProps) {
    if (deals.length === 0) return null;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <section className="py-6 md:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 mb-6">
                    <Tag size={20} className="text-red-600" />
                    <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                        Clearance Deals
                    </h2>
                    <span className="text-sm text-gray-500 ml-auto hidden sm:block">
                        While stocks last
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {deals.map((deal) => (
                        <div
                            key={deal.id}
                            className="relative border border-red-100 rounded-xl p-5 bg-white hover:shadow-md transition-shadow flex flex-col justify-between group"
                        >
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-1.5 bg-red-50 rounded-full px-3 py-1">
                                    <span className="text-xs font-bold text-red-700">
                                        {deal.deal === 'FLASH_SALE' ? 'Flash' : 'Featured'} — {deal.discount}% OFF
                                    </span>
                                </div>

                                <h3 className="font-sans text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-snug">
                                    {deal.title}
                                </h3>

                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>
                                        {formatDate(deal.startDate)}
                                    </span>
                                    <span className="text-gray-300">→</span>
                                    <span>
                                        {formatDate(deal.endDate)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-red-50">
                                <span className="text-xs text-red-700 font-medium group-hover:text-red-900 transition-colors">
                                    Shop Clearance →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
