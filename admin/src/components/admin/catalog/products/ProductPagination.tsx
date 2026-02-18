'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ProductPaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (items: number) => void;
}

export function ProductPagination({
    totalItems,
    itemsPerPage,
    currentPage,
    onPageChange,
    onItemsPerPageChange,
}: ProductPaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    if (totalItems === 0) return null;

    return (
        <div className="px-6 py-4 border border-gray-200 bg-gray-50/50 mt-4 rounded-md">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
                    <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(val) => onItemsPerPageChange(Number(val))}
                    >
                        <SelectTrigger className="w-[80px] h-8 border-gray-200">
                            <SelectValue placeholder={itemsPerPage} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="150">150</SelectItem>
                            <SelectItem value="200">200</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        products per page
                    </span>
                </div>

                {/* Page info and navigation */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{totalItems > 0 ? startIndex + 1 : 0}</span> to <span className="font-medium text-foreground">{endIndex}</span> of <span className="font-medium text-foreground">{totalItems}</span> products
                    </span>

                    <div className="flex items-center gap-1">
                        {/* Previous button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 border-gray-200"
                        >
                            Previous
                        </Button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) pageNum = i + 1;
                                else if (currentPage <= 3) pageNum = i + 1;
                                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                                else pageNum = currentPage - 2 + i;

                                return (
                                    <Button
                                        key={pageNum}
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onPageChange(pageNum)}
                                        className={`h-8 w-8 p-0 border-gray-200 ${currentPage === pageNum ? "bg-primary text-white border-primary" : ""}`}
                                    >
                                        {pageNum}
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Next button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="h-8 border-gray-200"
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
