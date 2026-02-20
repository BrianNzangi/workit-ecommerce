export const POSITION_LABELS: Record<string, string> = {
    HERO: 'Hero (Top Slider)',
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
        return imageType === 'desktop' ? '(1200 x 630px)' : '(1080 x 608px)';
    }
    if (position === 'DEALS') {
        return imageType === 'desktop' ? '(310 x 215px)' : '(310 x 165px)';
    }
    if (['DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM'].includes(position)) {
        return imageType === 'desktop' ? '(1200 x 210px)' : '(1080 x 210px)';
    }
    return '';
}

export function getRecommendationText(position: string) {
    if (position === 'HERO') {
        return 'Desktop - 1200 x 630 pixels, Mobile - 1080 x 608 pixels';
    }
    if (position === 'DEALS') {
        return 'Desktop: 310 x 215px (16:11), Mobile: 310 x 165px (16:8.5)';
    }
    if (['DEALS_HORIZONTAL', 'MIDDLE', 'BOTTOM'].includes(position)) {
        return 'Desktop: 1200 x 210px, Mobile: 1080 x 210px';
    }
    return '';
}
