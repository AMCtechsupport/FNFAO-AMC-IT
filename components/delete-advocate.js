"use client";

import { useState, useEffect } from "react";
import supabase from "../src/app/lib/supabase";
import { deleteAdvocate } from "../src/app/lib/delete-advocate-server";

const DeleteAdvocate = () => {
  const [advocates, setAdvocates] = useState([]);
  const [searchAdvocate, setSearchAdvocate] = useState("");
  const [selectedAdvocate, setSelectedAdvocate] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch advocates based on search query
  const fetchAdvocates = async (searchQuery = "") => {
    try {
      let query = supabase.from("Advocates").select("*");

      if (searchQuery) {
        const term = searchQuery.trim();
        // to ignore empty tokens
        const tokens = term.split(/\s+/).filter(Boolean);

        if (tokens.length >= 2) {
          const first = tokens[0];
          const last = tokens[tokens.length - 1];

          // Filter options to match names
          const orFilters = [
            `and(firstName.ilike.%${first}%,lastName.ilike.%${last}%)`,
            `and(firstName.ilike.%${last}%,lastName.ilike.%${first}%)`,
            `firstName.ilike.%${term}%`,
            `lastName.ilike.%${term}%`,
            `email.ilike.%${term}%`
          ];

          query = query.or(orFilters.join(","));
        } else {
          const t = tokens[0];
          query = query.or(
            `firstName.ilike.%${t}%,lastName.ilike.%${t}%,email.ilike.%${t}%`
          );
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching advocates:", error.message);
        setError("Error fetching advocates: " + error.message);
      } else {
        setAdvocates(data || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("Unexpected error occurred while fetching advocates.");
    }
  };

  useEffect(() => {
    fetchAdvocates(searchAdvocate);
  }, [searchAdvocate]);

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
    <div>
      {/* Title moved to header - removed duplicate */}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Warning:</strong> This will permanently delete the advocate from both the database 
          and their user account (if they have one). This action cannot be undone.
        </p>
      </div>

      {/* Search Section */}
      <div className="space-y-6">
        <div>
          <label
            htmlFor="searchAdvocate"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Search for Advocate:
          </label>
          <input
            id="searchAdvocate"
            type="text"
            placeholder="Search by name or email"
            value={searchAdvocate}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Display search results */}
        {advocates.length > 0 && (
          <div className="mt-4 border-2 rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
            <ul className="space-y-2">
              {advocates.map((advocate) => (
                <li
                  key={advocate.advocate_id}
                  onClick={() => handleSelectAdvocate(advocate)}
                  className={`p-3 cursor-pointer rounded-md transition-colors ${
                    selectedAdvocate?.advocate_id === advocate.advocate_id
                      ? "bg-red-100 border-2 border-red-300"
                      : "bg-white hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-800">
                    {advocate.firstName} {advocate.lastName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Email: {advocate.email}
                  </div>
                  <div className="text-xs text-gray-500">
                    ID: {advocate.advocate_id}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Selected advocate display */}
        {selectedAdvocate && (
          <div className="mt-4 p-4 border-2 border-red-200 rounded-lg bg-red-50">
            <h3 className="font-semibold text-red-800 mb-2">Selected for Deletion:</h3>
            <div className="text-gray-700">
              <p><strong>Name:</strong> {selectedAdvocate.firstName} {selectedAdvocate.lastName}</p>
              <p><strong>Email:</strong> {selectedAdvocate.email}</p>
              <p><strong>ID:</strong> {selectedAdvocate.advocate_id}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={!selectedAdvocate || loading}
            className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg border border-red-600 font-semibold hover:bg-red-700 hover:border-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete Advocate"}
          </button>

          <button
            type="button"
            onClick={handleClearForm}
            className="flex-1 py-3 px-6 bg-gray-500 text-white rounded-lg border border-gray-500 font-semibold hover:bg-gray-600 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete advocate{" "}
              <strong>
                {selectedAdvocate?.firstName} {selectedAdvocate?.lastName}
              </strong>
              ? This will remove them from both the database and their user account (if they have one). 
              This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAdvocate; 