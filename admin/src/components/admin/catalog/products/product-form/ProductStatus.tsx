'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductStatusProps {
    enabled: boolean;
    onEnabledChange: (value: boolean) => void;
}

export function ProductStatus({ enabled, onEnabledChange }: ProductStatusProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Product Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="enabled">Status</Label>
                    <Select
                        value={enabled.toString()}
                        onValueChange={(val) => onEnabledChange(val === 'true')}
                    >
                        <SelectTrigger id="enabled">
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                        Draft products are hidden from the storefront.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
