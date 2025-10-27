"use client";

import React from "react";

export default function ReportPreviewAdvocates({ onClose, children, downloadFormat, childrenDownloadButton }) {
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };
    // Ref for the content to be converted to PDF
  const contentRef = React.useRef(null);

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

          <h1 className="mb-6 text-2xl font-bold text-center">
             Report Preview {downloadFormat ? `(${downloadFormat.toUpperCase()})` : ''}
          </h1>
        </div>

        {/* Modal content */}
        <div className="overflow-y-auto text-center flex-grow" ref={contentRef}>
          <div className="my-8 space-y-4 text-gray-700">
            {children}
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex-shrink-0 flex justify-center mt-8">
          {childrenDownloadButton}
        </div>
      </div>
    </div>
  );
};