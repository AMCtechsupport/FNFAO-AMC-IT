import React from "react";

const LogsPagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  // Defensive normalization
  const total = Number(totalItems) || 0;
  const perPage = Math.max(1, Number(itemsPerPage) || 1);
  const totalPages = total > 0 ? Math.ceil(total / perPage) : 0;

  // Generate page numbers
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  // Normalize current page
  const current = Math.max(1, Number(currentPage) || 1);

  // Helper to go to a page clamped within [1, totalPages]
  const goToPage = (page) => {
    if (totalPages === 0) return;
    const p = Math.max(1, Math.min(Number(page) || 1, totalPages));
    if (p !== current) onPageChange(p);
  };

  return (
    <div className="flex justify-center items-center mt-6 space-x-4">
      <button
        onClick={() => goToPage(current - 1)}
        disabled={current <= 1 || totalPages === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        aria-label="Previous page"
      >
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={`px-4 py-2 rounded-lg ${
            page === current
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => goToPage(current + 1)}
        disabled={current >= totalPages || totalPages === 0}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  );
};

export default LogsPagination;
