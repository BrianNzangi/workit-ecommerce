'use client';

import { LayoutGrid } from 'lucide-react';

export default function DirectoryHero() {
    return (
        <header className="mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold tracking-wider uppercase">
                <LayoutGrid size={14} />
                Directory
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
                Our Collections
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl font-medium">
                Browse through our extensive catalog of products organized by categories to help you find exactly what you're looking for.
            </p>
        </header>
    );
}
