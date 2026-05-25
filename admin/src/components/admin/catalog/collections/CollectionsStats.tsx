import { FolderTree, CheckCircle2, TrendingUp, Layers } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collection } from './types';

interface CollectionsStatsProps {
    collections: Collection[];
}

function countAllCollections(collections: Collection[]): number {
    let count = 0;
    for (const collection of collections) {
        count += 1;
        if (collection.children) {
            count += countAllCollections(collection.children);
        }
    }
    return count;
}

function countActiveCollections(collections: Collection[]): number {
    let count = 0;
    for (const collection of collections) {
        if (collection.enabled) count += 1;
        if (collection.children) {
            count += countActiveCollections(collection.children);
        }
    }
    return count;
}

function countFeaturedCollections(collections: Collection[]): number {
    let count = 0;
    for (const collection of collections) {
        if (collection.showInMostShopped) count += 1;
        if (collection.children) {
            count += countFeaturedCollections(collection.children);
        }
    }
    return count;
}

function countTotalProducts(collections: Collection[]): number {
    let count = 0;
    for (const collection of collections) {
        count += collection._count?.products || 0;
        if (collection.children) {
            count += countTotalProducts(collection.children);
        }
    }
    return count;
}

export function CollectionsStats({ collections }: CollectionsStatsProps) {
    const stats = [
        {
            label: 'Total Collections',
            value: countAllCollections(collections),
            icon: FolderTree,
            color: 'text-primary-900',
            bgColor: 'bg-primary-50',
        },
        {
            label: 'Active',
            value: countActiveCollections(collections),
            icon: CheckCircle2,
            color: 'text-green-700',
            bgColor: 'bg-green-50',
        },
        {
            label: 'Featured',
            value: countFeaturedCollections(collections),
            icon: TrendingUp,
            color: 'text-purple-700',
            bgColor: 'bg-purple-50',
        },
        {
            label: 'Total Products',
            value: countTotalProducts(collections),
            icon: Layers,
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
