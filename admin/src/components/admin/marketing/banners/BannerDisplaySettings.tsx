'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { POSITION_OPTIONS } from '@/lib/banner/constants';

interface BannerDisplaySettings {
    position: string;
    sortOrder: number;
    enabled: boolean;
}

interface BannerDisplaySettingsProps {
    settings: BannerDisplaySettings;
    onChange: (settings: Partial<BannerDisplaySettings>) => void;
    disabled?: boolean;
}

export function BannerDisplaySettings({
    settings,
    onChange,
    disabled,
}: BannerDisplaySettingsProps) {
    return (
        <Card className="border-gray-200 shadow-xs">
            <CardHeader>
                <CardTitle className="text-lg font-black tracking-tight text-secondary-900">
                    Display Settings
                </CardTitle>
                <CardDescription className="font-medium text-secondary-500">
                    Control where and how this banner appears.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="banner-position">Position *</Label>
                    <Select
                        value={settings.position}
                        onValueChange={(value) => onChange({ position: value })}
                        disabled={disabled}
                    >
                        <SelectTrigger id="banner-position" className="border-gray-200 focus-visible:ring-primary-200">
                            <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                            {POSITION_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="banner-sort-order">Sort Order</Label>
                    <Input
                        id="banner-sort-order"
                        type="number"
                        value={settings.sortOrder}
                        onChange={(e) => onChange({ sortOrder: parseInt(e.target.value, 10) || 0 })}
                        className="border-gray-200 focus-visible:ring-primary-200"
                        disabled={disabled}
                    />
                    <p className="text-xs font-medium text-secondary-500">Lower numbers appear first.</p>
                </div>

                <div className="flex items-center gap-2 rounded-xs border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <Checkbox
                        id="banner-enabled"
                        checked={settings.enabled}
                        onCheckedChange={(checked) => onChange({ enabled: checked === true })}
                        disabled={disabled}
                        className="data-[state=checked]:bg-primary-900 data-[state=checked]:border-primary-900"
                    />
                    <Label htmlFor="banner-enabled" className="cursor-pointer text-sm font-semibold text-secondary-800">
                        Enable Banner
                    </Label>
                </div>
            </CardContent>
        </Card>
    );
}
