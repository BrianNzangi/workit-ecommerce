import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollectionFormData } from './types';

interface CollectionDisplaySettingsCardProps {
    formData: CollectionFormData;
    onFieldChange: (field: keyof CollectionFormData, value: string | number | boolean) => void;
}

export function CollectionDisplaySettingsCard({
    formData,
    onFieldChange,
}: CollectionDisplaySettingsCardProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle>Display Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-3">
                    <Checkbox
                        id="enabled"
                        checked={formData.enabled}
                        onCheckedChange={(checked) => onFieldChange('enabled', checked === true)}
                    />
                    <Label htmlFor="enabled" className="text-sm font-medium text-gray-900">
                        Enable Collection
                    </Label>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-4">
                    <Label htmlFor="sortOrder" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                        Directory Sort Order
                    </Label>
                    <Input
                        id="sortOrder"
                        type="number"
                        min={0}
                        value={formData.sortOrder}
                        onChange={(event) => onFieldChange('sortOrder', Number(event.target.value || 0))}
                        className="max-w-55"
                    />
                    <p className="text-[10px] text-gray-500">Controls order in the main collections directory.</p>
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                    <div className="flex items-start gap-3">
                        <Checkbox
                            id="showInMostShopped"
                            checked={formData.showInMostShopped}
                            onCheckedChange={(checked) => onFieldChange('showInMostShopped', checked === true)}
                        />
                        <div className="space-y-1">
                            <Label htmlFor="showInMostShopped" className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                <TrendingUp className="h-4 w-4" />
                                Show in Most Shopped
                            </Label>
                            <p className="text-xs text-gray-500">Display in the "Most Shopped" homepage section</p>
                        </div>
                    </div>

                    {formData.showInMostShopped ? (
                        <div className="space-y-2 pl-7">
                            <Label htmlFor="mostShoppedSortOrder" className="text-xs font-bold uppercase tracking-wider text-gray-700">
                                Most Shopped Sort Order
                            </Label>
                            <Input
                                id="mostShoppedSortOrder"
                                type="number"
                                min={0}
                                value={formData.mostShoppedSortOrder}
                                onChange={(event) => onFieldChange('mostShoppedSortOrder', Number(event.target.value || 0))}
                                className="max-w-55"
                            />
                            <p className="text-[10px] text-gray-500">Controls position in homepage carousel.</p>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
