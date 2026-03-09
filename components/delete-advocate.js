"use client";

import { useState, useEffect } from "react";
import { deleteAdvocate } from "../src/app/lib/delete-advocate-server";

const DeleteAdvocate = () => {
  const [allAdvocates, setAllAdvocates] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [searchAdvocate, setSearchAdvocate] = useState("");
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch advocates via secure server API (uses service role key)
  const fetchAdvocates = async () => {
    try {
      const res = await fetch(`/api/advocates`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const msg = json?.error || `Status ${res.status}`;
        console.error("Error fetching advocates from API:", msg);
        setError("Error fetching advocates: " + msg);
        return;
      }
      const json = await res.json();
      const advocatesList = json.advocates || [];
      setAllAdvocates(advocatesList);
      setAdvocates(advocatesList);
    } catch (err) {
      console.error("Unexpected error while fetching advocates:", err);
      setError("Unexpected error occurred while fetching advocates.");
    }
  };

  useEffect(() => {
    fetchAdvocates();
  }, []);

  useEffect(() => {
    const term = searchAdvocate.trim().toLowerCase();

    if (!term) {
      setAdvocates(allAdvocates);
      return;
    }

    const numericId = /^\d+$/.test(term) ? parseInt(term, 10) : null;

    const filtered = allAdvocates.filter((advocate) => {
      const firstName = (advocate.firstName || "").toLowerCase();
      const lastName = (advocate.lastName || "").toLowerCase();
      const email = (advocate.email || "").toLowerCase();

      if (numericId !== null) {
        return (
          advocate.advocate_id === numericId ||
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term)
        );
      }

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        email.includes(term)
      );
    });

    setAdvocates(filtered);
  }, [searchAdvocate, allAdvocates]);

  const handleSearchChange = (event) => {
    setSearchAdvocate(event.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleSelectAdvocate = (advocate) => {
    setSelectedAdvocate(advocate);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteClick = () => {
    if (!selectedAdvocate) {
      setError("Please select an advocate to delete.");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAdvocate) return;

    setLoading(true);
    setShowConfirmModal(false);

    try {
      const result = await deleteAdvocate(selectedAdvocate.advocate_id);
      
      if (result.success) {
        setSuccess(result.message);
        setSelectedAdvocate(null);
        setSearchAdvocate("");
        fetchAdvocates(); // Refresh the list
      }
    } catch (err) {
      console.error("Error deleting advocate:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmModal(false);
  };

  const handleClearForm = () => {
    setSearchAdvocate("");
    setSelectedAdvocate(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

      {/* Header */}
      <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider bg-red-600">
        Delete Advocate
      </div>

      <div className="p-6 space-y-4">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>⚠️ Warning:</strong> This permanently deletes the advocate from the database and their user account. This action cannot be undone.
        </div>

        {/* Search */}
        <div>
          <label htmlFor="searchAdvocate" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Search for Advocate
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              id="searchAdvocate"
              type="text"
              placeholder="Search by name or email"
              value={searchAdvocate}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition"
            />
          </div>
        </div>

        {/* Search results */}
        {advocates.length > 0 && (
          <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
            {advocates.map((advocate) => (
              <div
                key={advocate.advocate_id}
                onClick={() => handleSelectAdvocate(advocate)}
                className="px-3 py-2.5 cursor-pointer transition-colors text-sm"
                style={{ backgroundColor: selectedAdvocate?.advocate_id === advocate.advocate_id ? "#FEE2E2" : "" }}
                onMouseEnter={(e) => { if (selectedAdvocate?.advocate_id !== advocate.advocate_id) e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
                onMouseLeave={(e) => { if (selectedAdvocate?.advocate_id !== advocate.advocate_id) e.currentTarget.style.backgroundColor = ""; }}
              >
                <p className="font-medium text-gray-800">{advocate.firstName} {advocate.lastName}</p>
                <p className="text-xs text-gray-500 mt-0.5">{advocate.email}</p>
              </div>
            ))}
          </div>
        )}

        {/* Selected advocate */}
        {selectedAdvocate && (
          <div className="p-3 rounded-lg border text-sm bg-red-50 border-red-200">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-red-600">Selected for Deletion</p>
            <p className="font-medium text-gray-800">{selectedAdvocate.firstName} {selectedAdvocate.lastName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{selectedAdvocate.email}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={!selectedAdvocate || loading}
            className="flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors text-red-500 bg-red-50 hover:bg-red-100 border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete Advocate"}
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
          >
            Clear Search
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: "#47315E" }}>
              <h3 className="text-base font-semibold text-white">Confirm Deletion</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete advocate{" "}
                <strong>{selectedAdvocate?.firstName} {selectedAdvocate?.lastName}</strong>?
                This will remove them from both the database and their user account. This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg border transition-colors text-red-500 bg-red-50 hover:bg-red-100 border-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DeleteAdvocate; 