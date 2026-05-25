export const POSITION_LABELS: Record<string, string> = {
    HERO: 'Hero Top Slider',
    DEALS: 'Deals',
    DEALS_HORIZONTAL: 'Deals Horizontal',
    MIDDLE: 'Middle Section',
    BOTTOM: 'Bottom Section',
    COLLECTION_TOP: 'Collection Header',
};

export const POSITION_ORDER = [
    'HERO',
    'DEALS',
    'DEALS_HORIZONTAL',
    'MIDDLE',
    'BOTTOM',
    'COLLECTION_TOP',
];

export const POSITION_OPTIONS = POSITION_ORDER.map((value) => ({
    value,
    label: POSITION_LABELS[value] || value,
}));

export function getDimensionsText(position: string, imageType: 'desktop' | 'mobile') {
    if (position === 'HERO') {
        return imageType === 'desktop' ? '(3000 x 864px)' : '(1200 x 990px)';
    }
    if (position === 'DEALS') {
        return imageType === 'desktop' ? '(1200 x 825px)' : '(1200 x 630px)';
    }
    if (['DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM'].includes(position)) {
        return imageType === 'desktop' ? '(2400 x 420px)' : '(1200 x 700px)';
    }
    if (position === 'COLLECTION_TOP') {
        return imageType === 'desktop' ? '(2400 x 256px)' : '(1200 x 640px)';
    }
    return '';
}

export function getRecommendationText(position: string) {
    if (position === 'HERO') {
        return 'Desktop - 3000 x 864 pixels, Mobile - 1200 x 990 pixels';
    }
    if (position === 'DEALS') {
        return 'Desktop: 1200 x 825px (16:11), Mobile: 1200 x 630px (16:8.4)';
    }
    if (['DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM'].includes(position)) {
        return 'Desktop: 2400 x 420px, Mobile: 1200 x 700px';
    }
    if (position === 'COLLECTION_TOP') {
        return 'Desktop: 2400 x 256px, Mobile: 1200 x 640px';
    }
    return '';
}
