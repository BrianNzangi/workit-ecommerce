# Dashboard Components

This directory contains the new dashboard components with time-based filtering capabilities.

## Components

### TotalSalesCard
Displays total sales revenue with:
- Time range filtering (24h, 7d, 1m, 3m, 6m, 12m) - **Default: 24 hours**
- Percentage change indicator
- Comparison with previous period
- Compact currency formatting in **KES** (e.g., KES 350K)
- Brand primary color (#e46c5c) for buttons and highlights

### TotalOrdersCard
Shows total order count with:
- Time range filtering (24h, 7d, 1m, 3m, 6m, 12m) - **Default: 24 hours**
- Percentage change indicator
- Comparison with previous period
- Compact number formatting (e.g., 10.7K)
- Brand primary color (#e46c5c) for buttons and highlights

### PendingCanceledCard
Displays pending and canceled orders in a split layout:
- Time range filtering (24h, 7d, 1m, 3m, 6m, 12m) - **Default: 24 hours**
- Separate sections for pending and canceled orders
- Individual percentage change indicators for each
- Color-coded status (orange for pending, red for canceled)
- Brand primary color (#e46c5c) for buttons and highlights

### TimeFilter
Reusable time range filter component with 6 options:
- 24 Hours
- 7 Days
- Month
- 3 Months
- 6 Months
- 12 Months

## API Endpoints

### `/api/admin/dashboard/sales`
Returns sales data for the selected time range:
```typescript
{
  current: number;      // Current period sales in cents
  previous: number;     // Previous period sales in cents
  percentageChange: number;
}
```

### `/api/admin/dashboard/orders`
Returns order count data for the selected time range:
```typescript
{
  current: number;      // Current period order count
  previous: number;     // Previous period order count
  percentageChange: number;
}
```

### `/api/admin/dashboard/pending-canceled`
Returns pending and canceled order counts:
```typescript
{
  pending: {
    count: number;
    percentageChange: number;
  };
  canceled: {
    count: number;
    percentageChange: number;
  };
}
```

## Usage

```tsx
import { TotalSalesCard, TotalOrdersCard, PendingCanceledCard } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TotalSalesCard />
      <TotalOrdersCard />
      <PendingCanceledCard />
    </div>
  );
}
```

## Features

- **Responsive Design**: Cards adapt to different screen sizes
- **Loading States**: Skeleton loaders while data is being fetched
- **Error Handling**: Graceful error handling with console logging
- **Trend Indicators**: Visual indicators for positive/negative trends
- **Interactive Filters**: Easy-to-use time range selection
- **Brand Colors**: Uses the Workit brand color (#FF5023) for accents
