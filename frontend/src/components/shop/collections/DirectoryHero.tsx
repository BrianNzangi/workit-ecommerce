'use client';

import { LayoutGrid } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DirectoryHero() {
    return (
        <header className="mb-16 space-y-4">
            <Badge>
                <LayoutGrid size={14} />
                Directory
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Our Collections
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl font-medium">
                Browse through our extensive catalog of products organized by categories to help you find exactly what you&apos;re looking for.
            </p>
        </header>
    );
}
