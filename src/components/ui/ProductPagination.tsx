'use client';

interface ProductPaginationProps {
  currentPage: number;
  isLastPage: boolean;
  onPageChange: (page: number) => void;
}

export default function ProductPagination({ currentPage, isLastPage, onPageChange }: ProductPaginationProps) {
  // Generate page numbers with max 5 visible pages and ellipses
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const totalPages = isLastPage ? currentPage : currentPage + 1;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="mt-8 flex justify-center items-center space-x-2">
      {/* Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-l border text-sm font-medium transition ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Prev
      </button>

      {/* Page numbers */}
      {getPaginationPages().map((pageNum, idx) =>
        typeof pageNum === 'number' ? (
          <button
            key={idx}
            onClick={() => onPageChange(pageNum)}
            className={`px-4 py-2 text-sm font-medium rounded border transition ${
              pageNum === currentPage
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {pageNum}
          </button>
        ) : (
          <span key={idx} className="px-2 text-sm text-gray-500 select-none">
            {pageNum}
          </span>
        )
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className={`px-4 py-2 rounded-r border text-sm font-medium transition ${
          isLastPage
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        Next
      </button>
    </div>
  );
}