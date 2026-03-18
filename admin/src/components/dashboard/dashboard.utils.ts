export const currencyFormatter = new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
});

const countFormatter = new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
});

export const salesMixColors = ['#cc0000', '#e46c5c', '#181a1c', '#c5c6c6'];

export function formatMoney(amount: number) {
    return currencyFormatter.format(amount / 100).replace('KES', 'KSh');
}

export function formatMoneyCompact(amount: number) {
    const major = amount / 100;

    if (major >= 1_000_000) {
        return `KSh ${(major / 1_000_000).toFixed(1)}M`;
    }

    if (major >= 1_000) {
        return `KSh ${Math.round(major / 1_000)}K`;
    }

    return `KSh ${Math.round(major).toLocaleString()}`;
}

export function formatCount(value: number) {
    return countFormatter.format(value);
}

export function formatPercent(value: number) {
    return `${Math.abs(value).toFixed(1)}%`;
}

export function formatOrderState(value: string) {
    return value
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}
