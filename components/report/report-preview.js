"use client";

import AdvocatsTableData from "./advocates-table";
import React from "react";

const ReportPreview = ({ onClose, onDownload }) => {
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };

  const handleDownload = (e) => {
    e.preventDefault();
    if (onDownload) {
      onDownload();
    } else {
      alert("Download PDF");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative z-50 w-full max-w-md mx-4 overflow-hidden rounded-lg shadow-xl bg-white p-6 flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div className="flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            &times;
          </button>
          <h1 className="mb-6 text-2xl font-bold text-center">Report Preview</h1>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto text-center flex-grow">
          <AdvocatsTableData />
          
        </div>

        {/* Modal footer */}
        <div className="flex-shrink-0 flex justify-center mt-8">
          <button
            className="px-6 py-2 text-white transition rounded-lg bg-indigo-500 hover:bg-indigo-600"
            onClick={handleDownload}
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;