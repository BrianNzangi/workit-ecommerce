// src/data/TopCategoryData.ts
export interface TopCategory {
  id: number;
  name: string;
  slug: string;
}

export const TOP_CATEGORIES: TopCategory[] = [
  { id: 155, name: 'Android Smartphones', slug: 'android-smartphones' },
  { id: 160, name: 'Computer Accessories', slug: 'computer-accessories' },
  { id: 188, name: 'Earbuds', slug: 'earbuds' },
  { id: 159, name: 'Windows Laptops', slug: 'windows-laptops' },
  { id: 174, name: 'Andoid Watches', slug: 'android-watches' },
  { id: 176, name: 'Speakers', slug: 'speakers' },
  { id: 181, name: 'Small Appliances', slug: 'small-appliances' },
  { id: 189, name: 'Home Audio', slug: 'home-audio' },
  { id: 187, name: 'Smart TVs', slug: 'smart-tvs' },
  { id: 169, name: 'Video Games', slug: 'video-games' },
  { id: 182, name: 'Large Appliances', slug: 'large-appliances' },
  { id: 153, name: 'iPhone', slug: 'iphone' },
];