
"use client";
import React, { useState, useEffect } from "react";
import supabase from "@/app/lib/supabase";
import DeleteConfirmModal from "./DeleteConfirmModal";

const CFSAgenciesManagement = () => {
  const [cfsAgencies, setCfsAgencies] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [newCfsAgency, setNewCfsAgency] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const fetchCfsAgencies = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("CFS Agencies")
        .select("agencyName");

      if (error) {
        setError("Error fetching CFS agencies");
        console.error("Error fetching CFS agencies:", error);
      } else {
        setCfsAgencies(data);
      }

      setIsLoading(false);
    };

    fetchCfsAgencies();
  }, []);

  const handleAddCfsAgency = async () => {
    if (newCfsAgency.trim() === "") return;

    const { data, error } = await supabase
      .from("CFS Agencies")
      .insert([{ agencyName: newCfsAgency }]);

    if (error) {
      setError("Error adding new CFS Agency");
      console.error("Error adding new CFS Agency:", error);
    } else {
      setCfsAgencies([...cfsAgencies, { agencyName: newCfsAgency }]);
      setNewCfsAgency("");
      setShowForm(false);
    }
  };

  const handleEditCfsAgency = async (oldValue) => {
    if (editValue.trim() === "" || editValue === oldValue) {
      setEditingItem(null);
      return;
    }

    const { error } = await supabase
      .from("CFS Agencies")
      .update({ agencyName: editValue })
      .eq("agencyName", oldValue);

    if (error) {
      setError("Error updating CFS Agency");
      console.error("Error updating CFS Agency:", error);
    } else {
      setCfsAgencies(
        cfsAgencies.map((a) =>
          a.agencyName === oldValue ? { agencyName: editValue } : a,
        ),
      );
      setEditingItem(null);
      setEditValue("");
    }
  };

  const handleRemoveCfsAgency = async (agencyName) => {
    const { error } = await supabase
      .from("CFS Agencies")
      .delete()
      .eq("agencyName", agencyName);

    if (error) {
      setError("Error removing CFS Agency");
      console.error("Error removing CFS Agency:", error);
    } else {
      setCfsAgencies(
        cfsAgencies.filter((agency) => agency.agencyName !== agencyName),
      );
    }
    setShowDeleteModal(false);
    setToDelete(null);
  };

  const filtered = cfsAgencies.filter((agency) =>
    agency.agencyName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Manage CFS Agencies</h3>
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: "rgba(240, 238, 246, 0.8)",
            color: "rgba(97, 0, 215, 0.8)",
            border: "1px solid rgba(178, 179, 215, 0.8)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {cfsAgencies.length} {cfsAgencies.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search CFS Agencies..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border-2 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
          style={{ borderColor: "rgba(209, 213, 219, 0.5)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(97, 0, 215, 0.8)")}
          onBlur={(e) =>
            (e.currentTarget.style.borderColor = "rgba(209, 213, 219, 0.5)")
          }
          onMouseEnter={(e) => {
            if (document.activeElement !== e.currentTarget)
              e.currentTarget.style.borderColor = "rgba(97, 0, 215, 0.8)";
          }}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget)
              e.currentTarget.style.borderColor = "rgba(209, 213, 219, 0.5)";
          }}
        />
      </div>

      {/* Add Button + Form */}
      <div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setNewCfsAgency("");
          }}
          className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors border-2"
          style={{
            backgroundColor: "rgba(97, 0, 215, 0.08)",
            borderColor: "rgba(97, 0, 215, 0.24)",
            color: "rgba(97, 0, 215, 0.8)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff";
            e.currentTarget.style.borderColor = "rgba(97, 0, 215, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.08)";
            e.currentTarget.style.borderColor = "rgba(97, 0, 215, 0.24)";
          }}
        >
          {showForm ? "Cancel" : "+ Add New CFS Agency"}
        </button>

        {showForm && (
          <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input
              type="text"
              value={newCfsAgency}
              onChange={(e) => setNewCfsAgency(e.target.value)}
              placeholder="Enter a new CFS Agency"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
            />
            <button
              onClick={handleAddCfsAgency}
              className="mt-3 w-full py-2.5 text-sm font-medium rounded-lg transition-colors"
              style={{ backgroundColor: "rgba(97, 0, 215, 0.8)", color: "white" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)")
              }
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-600 font-medium text-sm text-center">
          {error}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <svg
            className="animate-spin h-6 w-6 mb-2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[600px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr
                className="text-white sticky top-0"
                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
              >
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider">
                  Agency Name
                </th>
                <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-10 px-4">
                    <div className="flex flex-col items-center text-gray-400">
                      <svg
                        className="w-10 h-10 mb-3 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                        />
                      </svg>
                      <p className="text-sm font-medium">No results found.</p>
                      <p className="text-xs mt-1">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((agency, index) => (
                  <tr
                    key={agency.agencyName}
                    className={`transition-colors hover:bg-gray-50 ${index % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 align-middle">
                      {editingItem === agency.agencyName ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        agency.agencyName
                      )}
                    </td>
                    <td className="py-3 px-4 align-middle whitespace-nowrap w-px text-center">
                      {editingItem === agency.agencyName ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleEditCfsAgency(agency.agencyName)
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4.5 12.75l6 6 9-13.5"
                              />
                            </svg>
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              setEditValue("");
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-2.5 py-1 rounded-full transition-colors"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(agency.agencyName);
                              setEditValue(agency.agencyName);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors border"
                            style={{
                              backgroundColor: "rgba(97, 0, 215, 0.08)",
                              borderColor: "rgba(97, 0, 215, 0.24)",
                              color: "rgba(97, 0, 215, 0.8)",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)";
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(97, 0, 215, 0.08)";
                              e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)";
                            }}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => { setShowDeleteModal(true); setToDelete(agency); }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors border"
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.1)",
                              borderColor: "rgba(239, 68, 68, 0.3)",
                              color: "#ef4444",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#ef4444";
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(239, 68, 68, 0.1)";
                              e.currentTarget.style.color = "#ef4444";
                            }}
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && toDelete && (
        <DeleteConfirmModal
          client={{ firstName: toDelete.agencyName, lastName: "" }}
          onConfirm={() => handleRemoveCfsAgency(toDelete.agencyName)}
          onCancel={() => { setShowDeleteModal(false); setToDelete(null); }}
        />
      )}
    </div>
  );
};

export default CFSAgenciesManagement;
