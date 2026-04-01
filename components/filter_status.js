"use client";

import SortDropdown from "./sort-dropdown";

// Dropdown option sets used by filter controls.
export const CLIENT_STATUS_OPTIONS = [
  { value: "all", label: "All Clients" },
  { value: "active", label: "Active Clients" },
  { value: "inactive", label: "Inactive Clients" },
  { value: "ciwg", label: "Critical Incident Working Group" },
];

export const CLIENT_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
];

const FILTER_OPTIONS = {
  status: CLIENT_STATUS_OPTIONS,
  sort: CLIENT_SORT_OPTIONS,
};

export default function FilterStatus({ value, onChange, variant = "status" }) {
  const options = FILTER_OPTIONS[variant] || CLIENT_STATUS_OPTIONS;
  return <SortDropdown value={value} onChange={onChange} options={options} />;
}