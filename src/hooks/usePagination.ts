import { useState, useMemo } from "react";

interface UsePaginationProps<T> {
  data: T[];
  itemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  paginatedData: T[];
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function usePagination<T>({
  data,
  itemsPerPage = 10,
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Reset to page 1 if current page exceeds total pages (e.g., after filtering)
  const safePage = Math.min(currentPage, totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, safePage, itemsPerPage]);

  const startIndex = (safePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(safePage * itemsPerPage, totalItems);

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (safePage < totalPages) {
      setCurrentPage(safePage + 1);
    }
  };

  const previousPage = () => {
    if (safePage > 1) {
      setCurrentPage(safePage - 1);
    }
  };

  return {
    currentPage: safePage,
    totalPages,
    paginatedData,
    goToPage,
    nextPage,
    previousPage,
    canGoNext: safePage < totalPages,
    canGoPrevious: safePage > 1,
    startIndex: totalItems > 0 ? startIndex : 0,
    endIndex,
    totalItems,
  };
}
