import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollectionFormHeaderProps {
    title: string;
    description?: string;
    onSave?: () => void;
    onCancel?: () => void;
    loading?: boolean;
    uploading?: boolean;
}

export function CollectionFormHeader({ title, description, onSave, onCancel, loading, uploading }: CollectionFormHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-gray-500 hover:text-gray-900">
                    <Link href="/admin/collections">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Collections
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
            </div>

            {onSave && (
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/collections">Cancel</Link>
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        className="bg-primary-900 hover:bg-primary-800"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Collection'}
                    </Button>
                </div>
            )}
        </div>
    );
}
