'use client';

import { Check, ChevronDown, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/shared/utils/cn';

interface MultiSelectOption {
    value: string;
    label: string;
    indent?: number;
}

interface MultiSelectProps {
    options: MultiSelectOption[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = 'Select...',
}: MultiSelectProps) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (value: string) => {
        onChange(
            selected.includes(value)
                ? selected.filter((v) => v !== value)
                : [...selected, value]
        );
    };

    const selectedLabels = options
        .filter((o) => selected.includes(o.value))
        .map((o) => o.label);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex min-h-10 w-full items-center justify-between rounded-sm bg-white px-3 py-2 text-sm transition-colors",
                    open
                        ? "ring-1 ring-secondary-200"
                        : "hover:bg-secondary-50"
                )}
            >
                <span className="flex flex-wrap gap-1">
                    {selectedLabels.length === 0 ? (
                        <span className="text-secondary-400">{placeholder}</span>
                    ) : (
                        selectedLabels.map((label) => (
                            <span
                                key={label}
                                className="inline-flex items-center gap-1 rounded-sm bg-secondary-100 px-2 py-0.5 text-xs"
                            >
                                {label}
                                <X
                                    className="h-3 w-3 cursor-pointer text-secondary-500 hover:text-secondary-700"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const opt = options.find((o) => o.label === label);
                                        if (opt) toggle(opt.value);
                                    }}
                                />
                            </span>
                        ))
                    )}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-secondary-400" />
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-sm bg-white shadow-lg">
                    <div className="max-h-64 overflow-y-auto p-1">
                        {options.length === 0 ? (
                            <p className="px-3 py-2 text-sm text-secondary-400">No options available</p>
                        ) : (
                            options.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggle(option.value)}
                                        className={cn(
                                            "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                                            isSelected ? "bg-secondary-100" : "hover:bg-secondary-50"
                                        )}
                                        style={{ paddingLeft: `${(option.indent || 0) * 12 + 8}px` }}
                                    >
                                        <div className={cn(
                                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm",
                                            isSelected
                                                ? "bg-primary text-white"
                                                : "bg-secondary-100"
                                        )}>
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <span className="truncate">{option.label}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
