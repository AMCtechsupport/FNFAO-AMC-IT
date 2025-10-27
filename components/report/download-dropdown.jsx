"use client";

import { useState } from "react";


export default function DownloadDropdown({ title, onDownloadSelect, defaultText }) {
    const [isOpen, setIsOpen] = useState(false);

    const downloadOptions = [
        { format: "pdf", label: "PDF" },
        { format: "csv", label: "CSV" },
        { format: "json", label: "JSON" },
    ];

    const handleSelect = (format) => {
        onDownloadSelect(format);
        setIsOpen(false);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
            
            <div className="relative">
                {/* Main Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex justify-center items-center gap-2"
                >
                    {defaultText} 
                    <svg
                        className={`w-4 h-4 transform transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="py-1">
                            {downloadOptions.map((option) => (
                                <button
                                    key={option.format}
                                    onClick={() => handleSelect(option.format)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Download as {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}