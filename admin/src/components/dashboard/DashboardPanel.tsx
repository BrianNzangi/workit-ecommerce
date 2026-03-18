import type { ReactNode } from 'react';

interface DashboardPanelProps {
    title: string;
    subtitle?: string;
    aside?: ReactNode;
    children: ReactNode;
}

export function DashboardPanel({ title, subtitle, aside, children }: DashboardPanelProps) {
    return (
        <section className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(6,7,9,0.35)] sm:p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
                    {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
                </div>
                {aside}
            </div>
            <div className="flex-1">{children}</div>
        </section>
    );
}
