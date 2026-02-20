import { Button } from '@/components/ui/button';

interface AssetsPaginationProps {
    currentPage: number;
    totalAssets: number;
    assetsPerPage: number;
    onPageChange: (page: number) => void;
}

export function AssetsPagination({
    currentPage,
    totalAssets,
    assetsPerPage,
    onPageChange,
}: AssetsPaginationProps) {
    if (totalAssets <= assetsPerPage) return null;

    const totalPages = Math.ceil(totalAssets / assetsPerPage);
    const from = (currentPage - 1) * assetsPerPage + 1;
    const to = Math.min(currentPage * assetsPerPage, totalAssets);

    return (
        <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600">
                Showing {from} to {to} of {totalAssets} assets
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <span className="px-3 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
