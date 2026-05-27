'use client';

import { useCountdown } from '@/hooks/useCountdown';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { FlashSale } from '@/lib/homepage/homepage-data';

interface CountdownBlockProps {
    label: string;
    value: number;
}

function CountdownBlock({ label, value }: CountdownBlockProps) {
    return (
        <div className="flex flex-col items-center">
            <span className="text-2xl md:text-3xl font-bold text-white tabular-nums leading-none">
                {String(value).padStart(2, '0')}
            </span>
            <span className="text-[10px] md:text-xs uppercase tracking-wider text-white/80 mt-1">
                {label}
            </span>
        </div>
    );
}

function FlashSaleTimer({ endDate }: { endDate: string }) {
    const { days, hours, minutes, seconds, isExpired } = useCountdown(endDate);

    if (isExpired) {
        return <span className="text-white/60 text-sm">Expired</span>;
    }

    return (
        <div className="flex items-center gap-2 md:gap-3">
            <span className="text-white/80 text-xs md:text-sm font-medium uppercase tracking-wider">
                Ends in
            </span>
            {days > 0 && <CountdownBlock label="Days" value={days} />}
            {days > 0 && <span className="text-white/40 text-xl font-light">:</span>}
            <CountdownBlock label="Hours" value={hours} />
            <span className="text-white/40 text-xl font-light">:</span>
            <CountdownBlock label="Min" value={minutes} />
            <span className="text-white/40 text-xl font-light">:</span>
            <CountdownBlock label="Sec" value={seconds} />
        </div>
    );
}

interface FlashSalesSectionProps {
    sales: FlashSale[];
}

export default function FlashSalesSection({ sales }: FlashSalesSectionProps) {
    const router = useRouter();

    const activeSale = useMemo(() => {
        if (!sales.length) return null;
        return sales.reduce((earliest, sale) =>
            new Date(sale.endDate) < new Date(earliest.endDate) ? sale : earliest
        );
    }, [sales]);

    if (!activeSale) return null;

    return (
        <section className="py-6 md:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-6 md:p-10">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5">
                                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                                <span className="text-white text-xs md:text-sm font-bold uppercase tracking-wider">
                                    Flash Sale
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight">
                                {activeSale.title}
                            </h2>

                            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-lg px-4 py-2">
                                <span className="text-2xl md:text-3xl font-black text-yellow-300">
                                    {activeSale.discount}%
                                </span>
                                <span className="text-white text-sm md:text-base font-semibold">
                                    OFF
                                </span>
                            </div>

                            <p className="text-white/80 text-sm md:text-base max-w-lg">
                                Limited time offer on select products. Don&apos;t miss out on these amazing deals!
                            </p>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-4 shrink-0">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 md:px-6 md:py-4">
                                <FlashSaleTimer endDate={activeSale.endDate} />
                            </div>

                            <button
                                onClick={() => router.push('/shop/collections/all')}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-white text-red-600 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors cursor-pointer text-sm md:text-base"
                            >
                                Shop Flash Sale
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
