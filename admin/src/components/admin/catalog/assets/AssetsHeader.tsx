import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AssetsHeaderProps {
    onUploadClick: () => void;
}

export function AssetsHeader({ onUploadClick }: AssetsHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900">Assets</h1>
                <p className="text-gray-600">Manage your media files</p>
            </div>
            <Button onClick={onUploadClick} className="bg-primary-900 hover:bg-primary-800 text-white">
                <Upload className="w-4 h-4" />
                Upload Assets
            </Button>
        </div>
    );
}
