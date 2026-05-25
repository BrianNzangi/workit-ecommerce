---
name: sidebar-menu-item
description: Add, remove, or reorganize sidebar navigation items
compatibility: opencode
metadata:
  framework: nextjs
  project: workit-ecommerce
---

## What I do

Modify the admin sidebar navigation structure — adding new sections, moving items between sections, removing deprecated links.

## When to use me

Use this when the sidebar navigation in the admin panel needs structural changes.

## File to edit

`admin/src/components/admin/layout/AdminSidebar.tsx`

## Structure

The sidebar is driven by the `menuSections` array:

```ts
interface MenuItem {
    label: string;
    href?: string;
    icon: any;
    children?: MenuItem[];
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    { title: 'Overview', items: [...] },
    { title: 'Commerce', items: [...] },
    { title: 'Promotions', items: [...] },
    { title: 'Content', items: [...] },
    { title: 'Administration', items: [...] },
];
```

## Patterns

### Add a top-level item (with children)

```ts
{
    label: 'SectionLabel',
    icon: SomeIcon,
    children: [
        { label: 'Child Label', href: '/admin/path', icon: null },
    ],
},
```

### Add a leaf link

```ts
{
    label: 'Page Name',
    href: '/admin/path',
    icon: SomeIcon,
},
```

### Move items between sections

Remove from source section's `items` array, add to target section's `items` array.

### Remove a section

Delete the entire section object from `menuSections`.

## Icons (from lucide-react)

Common ones used:
- `LayoutDashboard` — Dashboard
- `Package` — Catalog
- `ShoppingCart` — Orders
- `Users` — Customers
- `Percent` — Promotions
- `FileText` — Pages
- `Megaphone` — Blog
- `Image` — Banners
- `Settings` — Settings
- `Clock` — System

Import from `lucide-react` at the top of the file.

## Auto-expand behavior

The sidebar auto-expands parent items when a child route matches the current pathname. This is handled by `useEffect` in the component — no manual configuration needed.

## References

- Sidebar: `admin/src/components/admin/layout/AdminSidebar.tsx`
- Banner move example: Marketing section removed, Banners added under Content section with `Image` icon.
