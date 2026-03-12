/*
It is a UI component to show the Next, Prev and selected number of buttons.
*/

"use client";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const next = () => currentPage < totalPages && onPageChange(currentPage + 1);
  const prev = () => currentPage > 1 && onPageChange(currentPage - 1);

  if (totalPages <= 1) return null;

  // It shows the Previous button layout

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={prev}
        disabled={currentPage === 1}
        className={`px-2 py-1 rounded-md ${
          currentPage === 1
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "text-white hover:bg-purple-700"
        }`}
        style={{
          backgroundColor: currentPage === 1 ? undefined : "#6100D7"
        }}
      >
        Previous
      </button>

      {/* It shows the ellipsis for the middle pages */}
      
      <div className="flex gap-1">
        {[...Array(totalPages)].map((_, idx) => {
          const pageNum = idx + 1;
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
          ) {
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-2 py-1 rounded-md ${
                  currentPage === pageNum
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                style={{
                  backgroundColor: currentPage === pageNum ? "#6100D7" : undefined
                }}
              >
                {pageNum}
              </button>
            );
          } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
            return <span key={pageNum} className="px-2">...</span>;
          }
          return null;
        })}
      </div>

      {/* It shows the Next button layout*/}
      
      <button
        onClick={next}
        disabled={currentPage === totalPages}
        className={`px-2 py-1 rounded-md ${
          currentPage === totalPages
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "text-white hover:bg-purple-700"
        }`}
        style={{
          backgroundColor: currentPage === totalPages ? undefined : "#6100D7"
        }}
      >
        Next
      </button>
    </div>
  );
}