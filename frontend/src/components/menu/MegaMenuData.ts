export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string | { src: string };
  children?: Category[];
}

export const ORDER = [
  'Smartphones',
  'Laptops',
  'Tablets',
  'Gaming Consoles',
  'Smartwatches',
  'Audio',
  'Home Appliances',
  'More',
];