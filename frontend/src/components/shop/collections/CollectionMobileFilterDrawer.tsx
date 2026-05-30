'use client';

import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import FilterSidebar from '@/components/filters/FilterSidebar';

interface CollectionMobileFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedCategory: string | number | null;
  collectionSlug: string;
  onFilterChange: (filters: {
    category?: string | number | null;
    tag?: Array<string | number>;
    brand?: Array<string | number>;
    minPrice?: number;
    maxPrice?: number;
    onSale?: boolean;
    inStock?: boolean;
    shippingMethodId?: string;
  }) => void;
}

export default function CollectionMobileFilterDrawer({
  open,
  onClose,
  selectedCategory,
  collectionSlug,
  onFilterChange,
}: CollectionMobileFilterDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={(o) => { if (!o) onClose(); }} direction="left">
      <DrawerContent side="left" className="w-[85%] max-w-sm">
        <DrawerHeader className="border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-primary-900" />
              Filters
            </DrawerTitle>
            <DrawerClose asChild>
              <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X size={20} className="text-gray-400" />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <FilterSidebar
            selectedCategory={selectedCategory}
            collectionSlug={collectionSlug}
            onFilterChange={onFilterChange}
          />
        </div>

        <DrawerFooter className="border-t border-gray-100">
          <DrawerClose asChild>
            <Button className="w-full bg-primary-900 hover:bg-primary-800 text-white">
              Show Results
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
