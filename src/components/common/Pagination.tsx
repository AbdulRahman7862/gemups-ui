import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 4) {
        pages.push("...");
      }

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 5;
      }

      if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
      }

      for (let i = start; i <= end; i++) {
        if (i > 1 && i < totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 3) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 px-4 max-w-full no-scrollbar">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-full border border-[#142133] bg-[#030507] hover:bg-[#090e15] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors duration-200 flex-shrink-0"
        >
          <ChevronsLeft size={18} />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-full border border-[#142133] bg-[#030507] hover:bg-[#090e15] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors duration-200 flex-shrink-0"
        >
          <ChevronLeft size={18} />
        </button>

        {visiblePages.map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            disabled={page === "..."}
            className={`w-10 h-10 rounded-full border transition-colors duration-200 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
              page === currentPage
                ? "bg-[#13F195] text-black border-[#13F195]"
                : page === "..."
                ? "border-[#142133] bg-[#030507] cursor-default text-gray-400"
                : "border-[#142133] bg-[#030507] hover:bg-[#090e15] text-white"
            }`}
          >
            {page === "..." ? <MoreHorizontal size={18} /> : page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-full border border-[#142133] bg-[#030507] hover:bg-[#090e15] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors duration-200 flex-shrink-0"
        >
          <ChevronRight size={18} />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-full border border-[#142133] bg-[#030507] hover:bg-[#090e15] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors duration-200 flex-shrink-0"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
