import { AssetCard } from './AssetCard';
import { Asset } from './types';

interface AssetsGridProps {
    assets: Asset[];
    selectedAssetIds: string[];
    onToggleAssetSelection: (assetId: string) => void;
    onDeleteAsset: (assetId: string) => void;
}

export function AssetsGrid({
    assets,
    selectedAssetIds,
    onToggleAssetSelection,
    onDeleteAsset,
}: AssetsGridProps) {
    return (
        <div className="grid grid-cols-3 gap-4 md:grid-cols-5 lg:grid-cols-8">
            {assets.map((asset) => (
                <AssetCard
                    key={asset.id}
                    asset={asset}
                    selected={selectedAssetIds.includes(asset.id)}
                    onToggleSelect={onToggleAssetSelection}
                    onDelete={onDeleteAsset}
                />
            ))}
        </div>
    );
}
