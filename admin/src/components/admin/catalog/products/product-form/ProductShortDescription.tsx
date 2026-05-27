'use client';

import { RichTextEditor } from '../../../shared/RichTextEditor';

interface ProductShortDescriptionProps {
    value: string;
    onChange: (value: string) => void;
}

export function ProductShortDescription({ value, onChange }: ProductShortDescriptionProps) {
    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-secondary-900">Short Description</h2>
                <p className="text-xs text-secondary-400 mt-0.5">Brief product summary displayed on product cards and search results</p>
            </div>
            <RichTextEditor
                value={value}
                onChange={onChange}
                placeholder="A short summary of the product..."
            />
        </div>
    );
}
