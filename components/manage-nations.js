
"use client";
import React, { useState, useEffect, useCallback } from "react";
import supabase from "@/app/lib/supabase";
import DeleteConfirmModal from "./DeleteConfirmModal";

const EMPTY_DETAILS = {
  bandNumber: "",
  latitude: "",
  longitude: "",
  bandOfficePhone: "",
  chiefName: "",
};

function formatCoord(value) {
  if (value == null || value === "") return "—";
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(5) : "—";
}

const FirstNationManagement = () => {
  const [firstNations, setFirstNations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [newFirstNation, setNewFirstNation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDetails, setEditDetails] = useState(EMPTY_DETAILS);

  const fetchFirstNations = useCallback(async () => {
    setIsLoading(true);
    const { data, error: fetchError } = await supabase
      .from("First Nations")
      .select(
        'nation_id, firstNationMembership, bandNumber, latitude, longitude, bandOfficePhone, chiefName',
      )
      .order("firstNationMembership", { ascending: true });

    if (fetchError) {
      setError("Error fetching first nations");
    } else {
      setFirstNations(data || []);
      setError(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFirstNations();
  }, [fetchFirstNations]);

  const startEdit = (nation) => {
    setEditingKey(nation.firstNationMembership);
    setEditName(nation.firstNationMembership);
    setEditDetails({
      bandNumber: nation.bandNumber ?? "",
      latitude: nation.latitude ?? "",
      longitude: nation.longitude ?? "",
      bandOfficePhone: nation.bandOfficePhone ?? "",
      chiefName: nation.chiefName ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditName("");
    setEditDetails(EMPTY_DETAILS);
  };

  const handleAddFirstNation = async () => {
    if (newFirstNation.trim() === "") return;

    const { error: insertError } = await supabase
      .from("First Nations")
      .insert([{ firstNationMembership: newFirstNation.trim() }]);

    if (insertError) {
      setError("Error adding new First Nation");
    } else {
      setNewFirstNation("");
      setShowForm(false);
      await fetchFirstNations();
    }
  };

  const handleSaveFirstNation = async (originalName) => {
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    const payload = {
      firstNationMembership: trimmedName,
      bandNumber: editDetails.bandNumber === "" ? null : Number(editDetails.bandNumber),
      latitude: editDetails.latitude === "" ? null : Number(editDetails.latitude),
      longitude: editDetails.longitude === "" ? null : Number(editDetails.longitude),
      bandOfficePhone: editDetails.bandOfficePhone.trim() || null,
      chiefName: editDetails.chiefName.trim() || null,
    };

    const { error: updateError } = await supabase
      .from("First Nations")
      .update(payload)
      .eq("firstNationMembership", originalName);

    if (updateError) {
      setError("Error updating First Nation");
      return;
    }

    if (trimmedName !== originalName) {
      const { error: clientUpdateError } = await supabase
        .from("Clients")
        .update({ firstNationMembership: trimmedName })
        .eq("firstNationMembership", originalName);
      if (clientUpdateError) {
        setError("First Nation updated, but failed to update clients using this value.");
        await fetchFirstNations();
        cancelEdit();
        return;
      }
    }

    cancelEdit();
    await fetchFirstNations();
  };

  const handleRemoveFirstNation = async (firstNation) => {
    const { error: deleteError } = await supabase
      .from("First Nations")
      .delete()
      .eq("firstNationMembership", firstNation);

    if (deleteError) {
      setError("Error removing First Nation");
    } else {
      await fetchFirstNations();
    }
    setShowDeleteModal(false);
    setToDelete(null);
  };

  const filtered = firstNations.filter((nation) => {
    const haystack = [
      nation.firstNationMembership,
      nation.bandNumber,
      nation.chiefName,
      nation.bandOfficePhone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Manage First Nations</h3>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(240, 238, 246, 0.8)", color: "rgba(97, 0, 215, 0.8)", border: "1px solid rgba(178, 179, 215, 0.8)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {firstNations.length} {firstNations.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, band #, chief, or phone..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border-2 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
          style={{ borderColor: "rgba(209, 213, 219, 0.5)" }}
        />
      </div>

      <div>
        <button
          onClick={() => { setShowForm(!showForm); setNewFirstNation(""); }}
          className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors border-2"
          style={{ backgroundColor: "rgba(97, 0, 215, 0.08)", borderColor: "rgba(97, 0, 215, 0.24)", color: "rgba(97, 0, 215, 0.8)" }}
        >
          {showForm ? "Cancel" : "+ Add New First Nation"}
        </button>

        {showForm && (
          <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <input
              type="text"
              value={newFirstNation}
              onChange={(e) => setNewFirstNation(e.target.value)}
              placeholder="Enter a new First Nation"
              className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
            />
            <button
              onClick={handleAddFirstNation}
              className="mt-3 w-full py-2.5 text-sm font-medium rounded-lg transition-colors text-white"
              style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="text-red-600 font-medium text-sm text-center">{error}</div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
          <span className="text-sm">Loading...</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-h-[700px] overflow-y-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-white sticky top-0" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
                <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider">First Nation</th>
                <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider">Band #</th>
                <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider">Chief</th>
                <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider">Band Office</th>
                <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider">Coordinates</th>
                <th className="py-3 px-3 font-semibold text-xs uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 px-4 text-gray-400">
                    No results found.
                  </td>
                </tr>
              ) : (
                filtered.map((nation, index) => {
                  const isEditing = editingKey === nation.firstNationMembership;

                  return (
                    <React.Fragment key={nation.nation_id || nation.firstNationMembership}>
                      <tr className={`hover:bg-gray-50 ${index % 2 !== 0 ? "bg-gray-50/50" : ""}`}>
                        <td className="py-3 px-3 font-medium text-gray-800 align-top max-w-xs">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-2 py-1 text-sm bg-white border border-blue-300 rounded-lg focus:outline-none"
                            />
                          ) : (
                            nation.firstNationMembership
                          )}
                        </td>
                        <td className="py-3 px-3 text-gray-700 align-top whitespace-nowrap">
                          {nation.bandNumber ?? "—"}
                        </td>
                        <td className="py-3 px-3 text-gray-700 align-top">
                          {nation.chiefName || "—"}
                        </td>
                        <td className="py-3 px-3 text-gray-700 align-top whitespace-nowrap">
                          {nation.bandOfficePhone || "—"}
                        </td>
                        <td className="py-3 px-3 text-gray-600 align-top text-xs whitespace-nowrap">
                          {formatCoord(nation.latitude)}, {formatCoord(nation.longitude)}
                        </td>
                        <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                          {isEditing ? (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleSaveFirstNation(nation.firstNationMembership)}
                                className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEdit(nation)}
                                className="text-xs font-medium px-2.5 py-1 rounded-full border"
                                style={{ borderColor: "rgba(97, 0, 215, 0.3)", color: "rgba(97, 0, 215, 0.8)" }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => { setShowDeleteModal(true); setToDelete(nation); }}
                                className="text-xs font-medium px-2.5 py-1 rounded-full border text-red-600 border-red-200 bg-red-50"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {isEditing && (
                        <tr className="bg-purple-50/40">
                          <td colSpan="6" className="px-3 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                              <label className="text-xs text-gray-600">
                                Band #
                                <input
                                  type="number"
                                  value={editDetails.bandNumber}
                                  onChange={(e) => setEditDetails({ ...editDetails, bandNumber: e.target.value })}
                                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                />
                              </label>
                              <label className="text-xs text-gray-600">
                                Chief
                                <input
                                  type="text"
                                  value={editDetails.chiefName}
                                  onChange={(e) => setEditDetails({ ...editDetails, chiefName: e.target.value })}
                                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                />
                              </label>
                              <label className="text-xs text-gray-600">
                                Band office phone
                                <input
                                  type="text"
                                  value={editDetails.bandOfficePhone}
                                  onChange={(e) => setEditDetails({ ...editDetails, bandOfficePhone: e.target.value })}
                                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                />
                              </label>
                              <label className="text-xs text-gray-600">
                                Latitude
                                <input
                                  type="number"
                                  step="any"
                                  value={editDetails.latitude}
                                  onChange={(e) => setEditDetails({ ...editDetails, latitude: e.target.value })}
                                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                />
                              </label>
                              <label className="text-xs text-gray-600">
                                Longitude
                                <input
                                  type="number"
                                  step="any"
                                  value={editDetails.longitude}
                                  onChange={(e) => setEditDetails({ ...editDetails, longitude: e.target.value })}
                                  className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg"
                                />
                              </label>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDeleteModal && toDelete && (
        <DeleteConfirmModal
          client={{ firstName: toDelete.firstNationMembership, lastName: "" }}
          onConfirm={() => handleRemoveFirstNation(toDelete.firstNationMembership)}
          onCancel={() => { setShowDeleteModal(false); setToDelete(null); }}
        />
      )}
    </div>
  );
};

export default FirstNationManagement;
