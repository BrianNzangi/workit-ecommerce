export interface StoredSectionConfig {
    key: string;
    enabled: boolean;
    order: number;
}

export interface HomepageSectionConfig extends StoredSectionConfig {
    label: string;
    description: string;
}

export interface HomepageLayout {
    sections: StoredSectionConfig[];
}

export const AVAILABLE_SECTIONS: Omit<HomepageSectionConfig, 'enabled' | 'order'>[] = [
    { key: 'hero', label: 'Hero Banner', description: 'Full-width carousel with promotional banners' },
    { key: 'most-shopped', label: 'Most Shopped Categories', description: 'Circular category grid showing popular collections' },
    { key: 'deals', label: 'Deals', description: 'Grid of deal/promotion banner images' },
    { key: 'horizontal-banner', label: 'Horizontal Banner', description: 'Single wide promotional banner' },
    { key: 'homepage-collections', label: 'Homepage Collections', description: 'Product carousels organized by collection' },
    { key: 'featured-blogs', label: 'Featured Blogs', description: 'Latest blog posts grid' },
    { key: 'top-brands', label: 'Top Brands', description: 'Horizontal carousel of brand logos featured on the homepage' },
    { key: 'about-workit', label: 'About Workit', description: 'Static about section with brand story' },
];
