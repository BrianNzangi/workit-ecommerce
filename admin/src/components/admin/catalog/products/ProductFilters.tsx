'use client';

import React from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
        <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                        placeholder="Search products by name or slug..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-9 border-gray-200"
                    />
                </div>

                {/* Filter Toggle Button */}
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center justify-center gap-2 border-gray-200 h-10 px-4 ${showFilters || activeFiltersCount > 0 ? 'bg-primary-50 border-primary-200 text-primary-700' : ''}`}
                >
                    <Filter className="w-4 h-4" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                        <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
                <div className="bg-white p-6 rounded-xs shadow-xs border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Collection Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Collection
                            </label>
                            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="All Collections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All Collections</SelectItem>
                                    {collections.map((col) => (
                                        <SelectItem key={col.id} value={col.id}>
                                            {`${col.level > 0 ? `${'-- '.repeat(col.level)}` : ''}${col.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Brand Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Brand
                            </label>
                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="All Brands" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All Brands</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Publication Status
                            </label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All Statuses</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Condition Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition
                            </label>
                            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="All Conditions" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All Conditions</SelectItem>
                                    <SelectItem value="NEW">New</SelectItem>
                                    <SelectItem value="REFURBISHED">Refurbished</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Stock Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock Status
                            </label>
                            <Select value={selectedStockStatus} onValueChange={setSelectedStockStatus}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="All Stock Levels" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">All Stock Levels</SelectItem>
                                    <SelectItem value="in_stock">In Stock</SelectItem>
                                    <SelectItem value="low_stock">Low Stock (≤10)</SelectItem>
                                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Min Price Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Min Price (KES)
                            </label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMinPrice(e.target.value)}
                                className="border-gray-200"
                            />
                        </div>

                        {/* Max Price Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Max Price (KES)
                            </label>
                            <Input
                                type="number"
                                placeholder="999999"
                                value={maxPrice}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxPrice(e.target.value)}
                                className="border-gray-200"
                            />
                        </div>

                        {/* Clear Filters Button */}
                        <div className="flex items-end">
                            <Button
                                variant="outline"
                                onClick={clearFilters}
                                disabled={activeFiltersCount === 0}
                                className="w-full flex items-center justify-center gap-2 border-gray-200"
                            >
                                <X className="w-4 h-4" />
                                Clear Filters
                            </Button>
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {activeFiltersCount > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{filteredProductsCount}</span> of <span className="font-semibold">{totalProductsCount}</span> products
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
