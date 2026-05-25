import Link from 'next/link';
import {
    FileText,
    Edit,
    HelpCircle,
    Shield,
    Truck,
    Scale,
    Eye,
    Megaphone,
    ArrowLeftRight,
    CreditCard,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Page } from './types';

interface PagesTableProps {
    pages: Page[];
}

const PAGE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
    'returns-policy': { icon: <ArrowLeftRight className="h-4 w-4" />, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    'refunds-policy': { icon: <CreditCard className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    'shipping-policy': { icon: <Truck className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'terms-of-service': { icon: <Scale className="h-4 w-4" />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    'privacy-policy': { icon: <Shield className="h-4 w-4" />, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    'advertising-policy': { icon: <Megaphone className="h-4 w-4" />, color: 'text-pink-600', bgColor: 'bg-pink-50' },
    'help-center': { icon: <HelpCircle className="h-4 w-4" />, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
};

export function PagesTable({ pages }: PagesTableProps) {
    return (
        <div className="rounded-xl bg-white shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <span className="flex-1">Page</span>
                    <span className="w-32">Slug</span>
                    <span className="w-20 text-center">Status</span>
                    <span className="w-24 text-center">Updated</span>
                    <span className="w-20 text-right">Actions</span>
                </div>
            </div>

            <div className="divide-y divide-gray-50">
                {pages.map((page) => {
                    const config = PAGE_CONFIG[page.slug] || {
                        icon: <FileText className="h-4 w-4" />,
                        color: 'text-gray-600',
                        bgColor: 'bg-gray-50',
                    };

                    return (
                        <div key={page.slug} className="group px-6 py-4 transition-colors hover:bg-gray-50/50">
                            <div className="flex items-center gap-8">
                                <div className="flex flex-1 items-center gap-3">
                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bgColor} ${config.color}`}>
                                        {config.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {page.title}
                                        </p>
                                        <p className="truncate text-xs text-gray-400">
                                            {page.description}
                                        </p>
                                    </div>
                                </div>

                                <span className="w-32 font-mono text-xs text-gray-400">
                                    {page.slug}
                                </span>

                                <span className="flex w-20 justify-center">
                                    <Badge
                                        variant={page.hasContent ? 'success' : 'secondary'}
                                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                                            !page.hasContent ? 'bg-gray-100 text-gray-500' : ''
                                        }`}
                                    >
                                        {page.hasContent ? 'Published' : 'Draft'}
                                    </Badge>
                                </span>

                                <span className="w-24 text-center text-sm text-gray-400">
                                    {page.updatedAt
                                        ? new Date(page.updatedAt).toLocaleDateString()
                                        : 'Never'}
                                </span>

                                <div className="flex w-20 items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-primary-900 hover:bg-primary-50"
                                    >
                                        <Link href={`/admin/content/pages/${page.slug}`}>
                                            <Edit className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                    >
                                        <Link href={`/${page.slug}`} target="_blank">
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
