'use client';

export type TimeRange = '24h' | '7d' | '1m' | '3m' | '6m' | '12m';

interface TimeFilterProps {
    value: TimeRange;
    onChange: (value: TimeRange) => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '1m', label: 'Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: '12m', label: '12 Months' },
];

export function TimeFilter({ value, onChange }: TimeFilterProps) {
    return (
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {timeRanges.map((range) => (
                <button
                    key={range.value}
                    onClick={() => onChange(range.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${value === range.value
                            ? 'bg-white text-[#FF5023] shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    {range.label}
                </button>
            ))}
        </div>
    );
}
