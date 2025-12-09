/*
This component renders a modal preview for reports,
including a header, content area, and footer with a download button.
*/

"use client";

// import AdvocatsTableData from "./advocates-table";
import React from "react";

export default function ReportPreview({onClose, children, childrenDownloadButton }) {
  const handleClose = (e) => {
    e.preventDefault();
    onClose();
  };
    // Ref for the content to be converted to PDF
    const contentRef = React.useRef(null);

    // Event handler to generate and download PDF
    const handleDownload = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    // Ensure the contentRef is assigned else return nothing
    if (!contentRef.current) return;

    // Get the DOM element and set PDF options
    const element = contentRef.current;
    const options = {
      margin: 0.5,
      filename: "test.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    // Generate and save the PDF
    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative z-50 w-full max-w-xxl mx-4 overflow-hidden rounded-lg shadow-xl bg-white p-6 flex flex-col max-h-[90vh]">
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
        <div className="overflow-y-auto text-center flex-grow" ref={contentRef}>
          <div className="my-8 space-y-4 text-gray-700">
            {children}
          </div>
        </div>

        {/* Modal footer */}
        {/* Modal footer */}
        <div className="flex-shrink-0 flex justify-center mt-8">
          {childrenDownloadButton}
        </div>
      </div>
    </div>
  );
};