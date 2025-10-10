export interface Blog {
  id: number;
  title: string;
  slug: string;
  link: string;
  category: string;          // single main/featured category
  categories?: string[];     // optional array of all categories
  image: string;             // featured image URL
  excerpt?: string;          // optional excerpt
  content?: string;          // full content for reading page
  date?: string;             // optional, for sorting by date later
}
