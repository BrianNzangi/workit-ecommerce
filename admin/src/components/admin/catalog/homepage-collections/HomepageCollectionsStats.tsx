import { Star, CheckCircle2, XCircle, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { HomepageCollection } from './types';

interface HomepageCollectionsStatsProps {
    collections: HomepageCollection[];
}

export function HomepageCollectionsStats({ collections }: HomepageCollectionsStatsProps) {
    const totalCollections = collections.length;
    const activeCollections = collections.filter((c) => c.enabled).length;
    const inactiveCollections = totalCollections - activeCollections;
    const totalProducts = collections.reduce(
        (sum, c) => sum + (c.products?.length || 0),
        0
    );

    const stats = [
        {
            label: 'Total Collections',
            value: totalCollections,
            icon: Star,
            color: 'text-primary-900',
            bgColor: 'bg-primary-50',
        },
        {
            label: 'Active',
            value: activeCollections,
            icon: CheckCircle2,
            color: 'text-green-700',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Inactive',
            value: inactiveCollections,
            icon: XCircle,
            color: 'text-red-700',
            bgColor: 'bg-red-50',
        },
        {
            label: 'Total Products',
            value: totalProducts,
            icon: Package,
            color: 'text-blue-700',
            bgColor: 'bg-blue-50',
        },
    ];

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-gray-200">
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bgColor}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
