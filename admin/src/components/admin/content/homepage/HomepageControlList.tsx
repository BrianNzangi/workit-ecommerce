'use client';

import { useCallback } from 'react';
import { GripVertical, Eye, EyeOff } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import type { HomepageSectionConfig } from './types';

interface HomepageControlListProps {
    sections: HomepageSectionConfig[];
    onToggle: (key: string) => void;
    onMoveUp: (key: string) => void;
    onMoveDown: (key: string) => void;
}

export function HomepageControlList({ sections, onToggle, onMoveUp, onMoveDown }: HomepageControlListProps) {
    const enabledCount = sections.filter((s) => s.enabled).length;

    return (
        <Card>
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-900">Section Order</h2>
                    <span className="text-xs text-gray-500">
                        {enabledCount} of {sections.length} enabled
                    </span>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {sections.map((section, index) => (
                    <div
                        key={section.key}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex flex-col gap-0.5">
                            <button
                                onClick={() => onMoveUp(section.key)}
                                disabled={index === 0}
                                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed leading-none"
                                aria-label="Move up"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onMoveDown(section.key)}
                                disabled={index === sections.length - 1}
                                className="text-gray-300 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed leading-none"
                                aria-label="Move down"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />

                        <div className="flex-1 min-w-0">
                            <Label
                                htmlFor={`section-${section.key}`}
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                                {section.label}
                            </Label>
                            <p className="text-xs text-gray-500 truncate">{section.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-gray-400 tabular-nums w-5 text-center">
                                {section.order}
                            </span>
                            <Checkbox
                                id={`section-${section.key}`}
                                checked={section.enabled}
                                onCheckedChange={() => onToggle(section.key)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
