import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getImageUrl } from '@/lib/shared/images';
import { formatFileSize } from './assets-utils';
import { Asset } from './types';

interface AssetCardProps {
    asset: Asset;
    selected: boolean;
    onToggleSelect: (assetId: string) => void;
    onDelete: (assetId: string) => void;
}

export function AssetCard({ asset, selected, onToggleSelect, onDelete }: AssetCardProps) {
    return (
        <Card className="group relative overflow-hidden border-gray-200 p-0 transition-shadow hover:shadow-md">
            <label className="absolute top-2 left-2 z-10 inline-flex items-center justify-center">
                <Checkbox checked={selected} onCheckedChange={() => onToggleSelect(asset.id)} />
            </label>

            <div className="aspect-square bg-gray-100 flex items-center justify-center">
                {asset.type === 'IMAGE' ? (
                    <img
                        src={getImageUrl(asset.preview)}
                        alt={asset.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                )}
            </div>

            <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(asset.id)}
                className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 transition-opacity group-hover:opacity-100 bg-red-500 hover:bg-red-600"
            >
                <Trash2 className="w-4 h-4" />
            </Button>

            <div className="bg-white p-3">
                <p className="truncate text-sm font-medium text-gray-900" title={asset.name}>
                    {asset.name}
                </p>
                <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{asset.type}</span>
                    <span className="text-xs text-gray-500">{formatFileSize(asset.fileSize)}</span>
                </div>
                {asset.width && asset.height && (
                    <p className="mt-1 text-xs text-gray-500">
                        {asset.width} x {asset.height}
                    </p>
                )}
            </div>
        </Card>
    );
}
