import React from "react";

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
    <div className="flex justify-between items-center">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
      >
        Previous
      </button>
      
      <span>
        Page {currentPage} of {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};