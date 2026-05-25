---
name: admin-page-mira
description: Create admin list/detail/new/edit pages using shadcn mira style
compatibility: opencode
metadata:
  framework: nextjs
  ui: shadcn-mira
  project: workit-ecommerce
---

## What I do

Generate admin pages (list, new, edit) with consistent shadcn mira styling across the workit admin panel.

## When to use me

Use this when creating or refactoring any admin page under `admin/src/app/admin/`. Applicable to list pages (tables with search/filters/bulk actions) and form pages (create/edit).

## Style rules

- `rounded-sm` on all interactive elements (Card, Button, Input, SelectTrigger, Badge, Dialog)
- No borders — use `shadow-xs` on cards, `shadow-none` on card variants
- Inputs: `bg-muted` on SelectTrigger and Input (borders are removed)
- Search inputs: `pl-9` with a `<Search>` icon positioned `left-3 top-2.5`
- Page padding: `p-6`
- Header: `<h1 className="text-lg font-semibold">` + action buttons on the right
- Prices: `KES {Number(price).toLocaleString()}`
- No ID column in tables
- Table columns for product selectors: checkbox, Product (with thumbnail image), Category, Price (KES), Status, Action (trash icon)

## Imports to use

```tsx
import { ProtectedRoute } from "@/components/login/ProtectedRoute";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
```

## Date picker pattern

Use Calendar inside Popover (not native `<input type="date">`):

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/shared/utils/cn";

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-muted rounded-sm", !date && "text-muted-foreground")}>
      <CalendarIcon className="mr-2 h-4 w-4" />
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

## Product search pattern

```tsx
const searchProducts = async (query: string) => {
  if (!query) { setProductSuggestions([]); setShowSuggestions(false); return; }
  const res = await fetch(`/api/admin/products/search?q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (data.success) setProductSuggestions(data.products || data || []);
  setShowSuggestions(true);
};
```

## Wrapping

Every page must be wrapped:
```tsx
<ProtectedRoute>
  <AdminLayout>
    ...
  </AdminLayout>
</ProtectedRoute>
```

## List page layout

- Header row: title on left, search + filters + create button on right
- Card with `shadow-xs` wrapping a shadcn `<Table>`
- Status filter via `<Select>` with options like "All Status", "Active", "Draft", "Inactive"
- Delete dialog using shadcn `<Dialog>`

## References

- List example: `admin/src/app/admin/content/blog/page.tsx`
- New page example: `admin/src/app/admin/promotions/coupons/new/page.tsx`
- Product selector: `admin/src/app/admin/promotions/featured-deals/new/page.tsx`
