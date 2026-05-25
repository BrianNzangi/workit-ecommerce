'use client';

import { RichTextEditor } from '../../../shared/RichTextEditor';

interface ProductDescriptionProps {
    value: string;
    onChange: (value: string) => void;
}

export function ProductDescription({ value, onChange }: ProductDescriptionProps) {
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-secondary-900">Description</h2>
                <p className="text-xs text-secondary-400 mt-0.5">Detailed product information for customers</p>
            </div>
            <RichTextEditor
                value={value}
                onChange={onChange}
                placeholder="Describe your product's features, specifications, and benefits..."
            />
        </div>
    );
}
