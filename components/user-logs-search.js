import React from "react";

const LogSearchBar = ({ value, onSearchChange }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onSearchChange}
      placeholder="Search by Client ID"
      className="border p-2 rounded w-full mb-4"
    />
  );
};

export default LogSearchBar;
