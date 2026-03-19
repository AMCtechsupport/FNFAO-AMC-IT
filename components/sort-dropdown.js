"use client";

import { useState, useRef, useEffect } from "react";

const SortDropdown = ({ value, onChange, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const defaultOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "az", label: "A-Z" },
    { value: "za", label: "Z-A" },
  ];

  const displayOptions = options.length > 0 ? options : defaultOptions;
  const selectedLabel =
    displayOptions.find((opt) => opt.value === value)?.label || "Sort";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-2 text-white text-sm font-medium px-4 py-1.5 cursor-pointer transition rounded-lg whitespace-nowrap"       
         style={{
          backgroundColor: "rgba(97, 0, 215, 0.8)",
          minWidth: "140px",
          width: "auto",
        }}
        onMouseEnter={(e) => {
          if (!isOpen)
            e.currentTarget.style.backgroundColor = "rgba(74, 0, 153, 0.8)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen)
            e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)";
        }}
      >
        {selectedLabel}
        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50"
          style={{
            borderRadius: "0 0 8px 8px",
            width: "140px",
          }}
        >
          {displayOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                value === option.value
                  ? "bg-purple-50/80/80 text-purple-700/80/80"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              style={
                value === option.value
                  ? {
                      backgroundColor: "rgba(97, 0, 215, 0.08)",
                      color: "rgba(97, 0, 215, 0.8)",
                    }
                  : {}
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
