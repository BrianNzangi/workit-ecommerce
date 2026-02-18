'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '../../../shared/RichTextEditor';

interface ProductDescriptionProps {
    value: string;
    onChange: (value: string) => void;
}

export function ProductDescription({ value, onChange }: ProductDescriptionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
                <RichTextEditor
                    value={value}
                    onChange={onChange}
                    placeholder="Enter product description..."
                />
            </CardContent>
        </Card>
    );
}
