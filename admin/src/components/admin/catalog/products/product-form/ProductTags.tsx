'use client';

import { useState, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/shared/utils/cn';

interface ProductTagsProps {
    tags: string;
    onChange: (tags: string) => void;
}

export function ProductTags({ tags, onChange }: ProductTagsProps) {
    const [inputValue, setInputValue] = useState('');

    const tagArray = tags
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

    const addTags = (raw: string[]) => {
        const unique = new Set(tagArray);
        const toAdd: string[] = [];
        for (const item of raw) {
            const tag = item.trim().replace(/,/g, '');
            if (tag && !unique.has(tag)) {
                unique.add(tag);
                toAdd.push(tag);
            }
        }
        if (!toAdd.length) return;
        onChange([...tagArray, ...toAdd].join(', '));
    };

    const addTag = (raw: string) => addTags([raw]);

    const removeTag = (index: number) => {
        onChange(tagArray.filter((_, i) => i !== index).join(', '));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            if (inputValue.includes(',')) {
                addTags(inputValue.split(','));
            } else {
                addTag(inputValue);
            }
            setInputValue('');
        }
        if (e.key === 'Backspace' && !inputValue && tagArray.length > 0) {
            removeTag(tagArray.length - 1);
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        if (text.includes(',') || text.includes('\n')) {
            e.preventDefault();
            const parts = text.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean);
            if (parts.length > 1) {
                addTags(parts);
            } else {
                setInputValue(parts[0] || '');
            }
        }
    };

    const commitInput = () => {
        if (!inputValue) return;
        if (inputValue.includes(',')) {
            addTags(inputValue.split(','));
        } else {
            addTag(inputValue);
        }
        setInputValue('');
    };

    return (
        <div className="rounded-lg bg-white p-5">
            <div className="mb-3">
                <h2 className="text-sm font-semibold text-secondary-900">Product Tags</h2>
                <p className="text-xs text-secondary-400 mt-0.5">
                    Adding these to your product tags boosts search visibility
                </p>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {tagArray.map((tag, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-sm bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(i)}
                            className="inline-flex items-center justify-center hover:text-primary-foreground hover:bg-primary rounded-sm w-3.5 h-3.5 transition-colors"
                        >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        </button>
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={commitInput}
                placeholder="Type a tag and press Enter"
                className={cn(
                    'flex h-8 w-full rounded-sm border border-input bg-white px-2 py-1',
                    'text-xs placeholder:text-muted-foreground',
                    'focus:outline-none focus:ring-1 focus:ring-ring',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                )}
            />
        </div>
    );
}
