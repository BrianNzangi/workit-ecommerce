import { FileText, CheckCircle2, Pencil, HelpCircle } from 'lucide-react';
import { Page } from './types';

interface PagesStatsProps {
    pages: Page[];
}

export function PagesStats({ pages }: PagesStatsProps) {
    const totalPages = pages.length;
    const publishedPages = pages.filter((p) => p.hasContent).length;
    const draftPages = totalPages - publishedPages;
    const totalArticles = pages.reduce((sum, p) => sum + p.articleCount, 0);

    const stats = [
        {
            label: 'Total Pages',
            value: totalPages,
            icon: FileText,
            color: 'text-primary-700',
            bgColor: 'bg-primary-50',
        },
        {
            label: 'Published',
            value: publishedPages,
            icon: CheckCircle2,
            color: 'text-green-700',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Draft',
            value: draftPages,
            icon: Pencil,
            color: 'text-amber-700',
            bgColor: 'bg-amber-50',
        },
        {
            label: 'Help Articles',
            value: totalArticles,
            icon: HelpCircle,
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="rounded-xl bg-white p-5 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold tracking-tight text-gray-900">{stat.value}</p>
                            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
