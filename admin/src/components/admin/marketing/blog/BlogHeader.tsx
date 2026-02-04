import { ReactNode } from 'react';

interface BlogHeaderProps {
    title: string;
    description?: string;
    onAction?: () => void;
    actionLabel?: string;
    actionIcon?: ReactNode;
}

export function BlogHeader({
    title,
    description,
    onAction,
    actionLabel,
    actionIcon,
}: BlogHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                {description && <p className="text-gray-600">{description}</p>}
            </div>
            {onAction && actionLabel && (
                <button
                    onClick={onAction}
                    className="flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-lg hover:bg-primary-900 transition-colors shadow-sm"
                >
                    {actionIcon}
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
