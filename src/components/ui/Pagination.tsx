interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="flex justify-between items-center gap-2 sm:gap-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[36px] sm:min-h-0"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>
      
      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
        <span className="hidden sm:inline">Page </span>
        <span className="font-medium">{currentPage}</span>
        <span className="hidden sm:inline"> of {totalPages}</span>
        <span className="sm:hidden">/{totalPages}</span>
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-gray-200 hover:bg-gray-300 active:bg-gray-400 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[36px] sm:min-h-0"
      >
        Next
      </button>
    </div>
  );
};