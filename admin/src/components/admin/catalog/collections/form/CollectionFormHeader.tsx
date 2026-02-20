import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionFormHeaderProps {
    title: string;
    description?: string;
}

export function CollectionFormHeader({ title, description }: CollectionFormHeaderProps) {
    return (
        <div className="mb-6">
            <Button asChild variant="ghost" className="mb-3 pl-0 text-gray-600 hover:text-gray-900">
                <Link href="/admin/collections">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Collections
                </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {description ? <p className="mt-1 text-gray-600">{description}</p> : null}
        </div>
    );
}
