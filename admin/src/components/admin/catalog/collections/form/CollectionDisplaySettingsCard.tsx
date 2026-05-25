import { Menu, TrendingUp } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollectionFormData, CollectionLevel } from './types';

interface CollectionDisplaySettingsCardProps {
    formData: CollectionFormData;
    onFieldChange: (field: keyof CollectionFormData, value: string | number | boolean) => void;
    level?: CollectionLevel;
}

export function CollectionDisplaySettingsCard({
    formData,
    onFieldChange,
    level,
}: CollectionDisplaySettingsCardProps) {
    return (
        <div className="bg-white p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Display Settings</h3>

            {level === '1' && (
                <div className="flex items-center gap-2 mb-4">
                    <Checkbox
                        id="showInMenuHeader"
                        checked={formData.showInMenuHeader}
                        onCheckedChange={(checked) => onFieldChange('showInMenuHeader', checked === true)}
                    />
                    <Label htmlFor="showInMenuHeader" className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Menu className="w-3.5 h-3.5" />
                        Show in Menu Header
                    </Label>
                </div>
            )}

            <div className="flex items-center gap-2">
                <Checkbox
                    id="showInMostShopped"
                    checked={formData.showInMostShopped}
                    onCheckedChange={(checked) => onFieldChange('showInMostShopped', checked === true)}
                />
                <Label htmlFor="showInMostShopped" className="flex items-center gap-1.5 text-sm text-gray-700">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Most Shopped
                </Label>
            </div>

            {formData.showInMostShopped && (
                <div className="flex items-center gap-2 mt-3">
                    <Label htmlFor="mostShoppedSortOrder" className="text-xs text-gray-500">
                        Position
                    </Label>
                    <Input
                        id="mostShoppedSortOrder"
                        type="number"
                        min={0}
                        value={formData.mostShoppedSortOrder}
                        onChange={(event) => onFieldChange('mostShoppedSortOrder', Number(event.target.value || 0))}
                        className="w-16"
                    />
                </div>
            )}
        </div>
    );
}
