'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
    DrawerFooter,
    DrawerClose,
    DrawerTrigger,
} from '@/components/ui/drawer';

interface ProductFiltersProps {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    selectedCollection: string;
    setSelectedCollection: (val: string) => void;
    selectedBrand: string;
    setSelectedBrand: (val: string) => void;
    selectedStatus: string;
    setSelectedStatus: (val: string) => void;
    selectedCondition: string;
    setSelectedCondition: (val: string) => void;
    selectedStockStatus: string;
    setSelectedStockStatus: (val: string) => void;
    minPrice: string;
    setMinPrice: (val: string) => void;
    maxPrice: string;
    setMaxPrice: (val: string) => void;
    showFilters: boolean;
    setShowFilters: (val: boolean) => void;
    activeFiltersCount: number;
    clearFilters: () => void;
    collections: Array<{ id: string; name: string; level: number }>;
    brands: Array<{ id: string; name: string }>;
    filteredProductsCount: number;
    totalProductsCount: number;
}

export function ProductFilters({
    searchTerm,
    setSearchTerm,
    selectedCollection,
    setSelectedCollection,
    selectedBrand,
    setSelectedBrand,
    selectedStatus,
    setSelectedStatus,
    selectedCondition,
    setSelectedCondition,
    selectedStockStatus,
    setSelectedStockStatus,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    clearFilters,
    collections,
    brands,
    filteredProductsCount,
    totalProductsCount,
}: ProductFiltersProps) {
    return (
        <div className="flex gap-2">
            <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-9 border"
                />
            </div>
            <Drawer open={showFilters} onOpenChange={setShowFilters} direction="right">
                <DrawerTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                </DrawerTrigger>
                <DrawerContent side="right" className="w-[480px] max-w-[90vw]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Filter Products</DrawerTitle>
                        <DrawerDescription>Refine your product catalog view</DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4 pb-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Collection</label>
                                <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                                    <SelectTrigger className="border">
                                        <SelectValue placeholder="All Collections" />
                                    </SelectTrigger>
                                    <SelectContent className="border">
                                        <SelectItem value="none">All Collections</SelectItem>
                                        {collections.map((col) => (
                                            <SelectItem key={col.id} value={col.id}>
                                                {`${col.level > 0 ? `${'— '.repeat(col.level)}` : ''}${col.name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Brand</label>
                                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                    <SelectTrigger className="border">
                                        <SelectValue placeholder="All Brands" />
                                    </SelectTrigger>
                                    <SelectContent className="border">
                                        <SelectItem value="none">All Brands</SelectItem>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={brand.id}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="border">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent className="border">
                                        <SelectItem value="none">All Statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Condition</label>
                                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                                    <SelectTrigger className="border">
                                        <SelectValue placeholder="All Conditions" />
                                    </SelectTrigger>
                                    <SelectContent className="border">
                                        <SelectItem value="none">All Conditions</SelectItem>
                                        <SelectItem value="NEW">New</SelectItem>
                                        <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Stock Status</label>
                                <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                                    <SelectTrigger className="border">
                                        <SelectValue placeholder="All Stock Levels" />
                                    </SelectTrigger>
                                    <SelectContent className="border">
                                        <SelectItem value="none">All Stock Levels</SelectItem>
                                        <SelectItem value="in_stock">In Stock</SelectItem>
                                        <SelectItem value="low_stock">Low Stock (≤10)</SelectItem>
                                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Min Price (KES)</label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minPrice}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)}
                                    className="border"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium">Max Price (KES)</label>
                                <Input
                                    type="number"
                                    placeholder="999999"
                                    value={maxPrice}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)}
                                    className="border"
                                />
                            </div>
                        </div>

                        {activeFiltersCount > 0 && (
                            <div className="mt-4 border-t pt-3 text-sm text-muted-foreground">
                                Showing <span className="font-medium text-foreground">{filteredProductsCount}</span> of <span className="font-medium text-foreground">{totalProductsCount}</span> products
                            </div>
                        )}
                    </div>
                    <DrawerFooter className="flex-col gap-2">
                        <Button variant="outline" onClick={clearFilters} disabled={activeFiltersCount === 0} className="gap-2">
                            <X className="h-4 w-4" />
                            Clear Filters
                        </Button>
                        <DrawerClose asChild>
                            <Button>Done</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
