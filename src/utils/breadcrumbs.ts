// Utility to build breadcrumbs from category relationships
export type Category = {
  id: number;
  name: string;
  slug: string;
  parent?: number;
};

export type Breadcrumb = {
  name: string;
  slug: string;
  id?: number;
  url: string;
};

export function buildBreadcrumbs(categories: Category[], allCategories: Category[]): Breadcrumb[] {
  // categories: array of category objects for the product (usually at least one)
  // allCategories: array of all category objects { id, name, slug, parent }
  if (!categories || categories.length === 0) return [];

  // Pick the first category as the primary
  let current: Category | undefined = categories[0];
  const breadcrumbs = [];

  // Traverse up the parent chain
  while (current) {
    breadcrumbs.unshift({
      name: current.name,
      slug: current.slug,
      id: current.id,
      url: `/category/${current.slug}`,
    });
    if (!current.parent || current.parent === 0) break;
    current = allCategories.find((cat: Category) => cat.id === current!.parent);
  }

  // Add Home at the start
  breadcrumbs.unshift({ name: 'Home', slug: '', url: '/' });
  return breadcrumbs;
}
