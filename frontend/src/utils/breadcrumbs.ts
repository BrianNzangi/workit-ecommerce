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

// Find the L2 category (second level) from a product's categories
export function findL2Category(productCategories: Category[], allCategories: Category[]): Category | null {
  if (!productCategories || productCategories.length === 0 || !allCategories) {
    return null;
  }

  // For each product category, traverse up to find the L2 category
  for (const productCategory of productCategories) {
    const categoryChain = buildCategoryChain(productCategory, allCategories);

    // Find L2 category (second level from root)
    // Root (L1) has parent = 0 or no parent
    // L2 has a parent that is L1
    // L3 has a parent that is L2
    if (categoryChain.length >= 2) {
      // Return the second level category (index 1, since index 0 is root)
      return categoryChain[1];
    }
  }

  return null;
}

// Build the full category chain from leaf to root
function buildCategoryChain(leafCategory: Category, allCategories: Category[]): Category[] {
  const chain: Category[] = [];
  let current: Category | undefined = leafCategory;

  while (current) {
    chain.unshift(current);
    if (!current.parent || current.parent === 0) break;
    current = allCategories.find(cat => cat.id === current!.parent);
  }

  return chain;
}
