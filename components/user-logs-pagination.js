// components/Pagination.js

import React from "react";

const UserLogPagination = ({
  currentPage,
  totalLogs,
  logsPerPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
      >
        Next
      </button>
    </div>
  );
};

export default UserLogPagination;
