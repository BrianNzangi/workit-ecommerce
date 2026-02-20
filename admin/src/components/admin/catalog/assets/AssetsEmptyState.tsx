import { Image as ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AssetsEmptyStateProps {
    onUploadClick: () => void;
}

export function AssetsEmptyState({ onUploadClick }: AssetsEmptyStateProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardContent className="py-12 text-center">
                <ImageIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No assets yet</h3>
                <p className="mb-4 text-gray-600">Upload your first image or file</p>
                <Button onClick={onUploadClick} className="bg-primary-900 hover:bg-primary-800 text-white">
                    <Upload className="w-4 h-4" />
                    Upload Your First Asset
                </Button>
            </CardContent>
        </Card>
    );
}
