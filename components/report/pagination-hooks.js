/*
This hook component is used to manage page state, calculate data and show 
data accordingly.
*/

import { useMemo, useState } from "react";

export function usePagination(data, itemsPerPage ) {
  const [currentPage, setCurrentPage] = useState(1);

  const { currentItems, totalPages, totalItems } = useMemo(() => {
    const totalItems = data.length;
    // Used Math.ceil to count partial pages as full pages
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    // To slice data for the current page
    const currentItems = data.slice(start, end);
    return { currentItems, totalPages, totalItems };
  }, [data, currentPage, itemsPerPage]);

  return { currentItems, currentPage, totalPages, totalItems, setCurrentPage };
}