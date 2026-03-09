"use client";

import { updateClientStatus } from "./client-active";
import { useState, useEffect, useRef } from "react";

export default function AssignAdvocate({
  clients: initialClients = [],
  advocates: initialAdvocates = [],
}) {
  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [allAdvocates, setAllAdvocates] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [searchAdvocate, setSearchAdvocate] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAdvocate, setSelectedAdvocate] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  const containerRef = useRef(null);

  // Deselect client and advocate when clicking outside this block
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSelectedClient(null);
        setSelectedAdvocate("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const initialClientsList = [...(initialClients || [])].sort(
      (a, b) => new Date(b.dateModified || 0) - new Date(a.dateModified || 0),
    );
    setAllClients(initialClientsList);
    setFilteredClients(initialClientsList);

    const initialAdvocatesList = [...(initialAdvocates || [])];
    setAllAdvocates(initialAdvocatesList);
    setAdvocates(initialAdvocatesList);
  }, [initialClients, initialAdvocates]);

  // Client-side filter for immediate feedback (debounced)
  const filterClients = (query) => {
    if (!query.trim()) {
      setFilteredClients(allClients);
      return;
    }

    const term = query.toLowerCase().trim();
    const numericId = !isNaN(term) && term !== "" ? parseInt(term, 10) : null;

    const filtered = allClients.filter((client) => {
      if (numericId !== null) {
        return client.client_id === numericId;
      }
      const fullName =
        `${client.firstName || ""} ${client.middleName || ""} ${client.lastName || ""}`.toLowerCase();
      return fullName.includes(term);
    });

    setFilteredClients(filtered.slice(0, 50)); // Limit to 50 results
  };

  const filterAdvocates = (query) => {
    if (!query.trim()) {
      setAdvocates(allAdvocates);
      return;
    }

    const term = query.toLowerCase().trim();
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
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(
        `/api/clients?clientType=Youth%20Intake&pageSize=1000`,
      );
      if (!res.ok) {
        console.error("Error fetching clients");
        setAllClients([]);
        setFilteredClients([]);
        return;
      }

      const json = await res.json();
      const youthClients = json.data || [];

      const res2 = await fetch(
        `/api/clients?clientType=Pre-Intake&pageSize=1000`,
      );
      if (!res2.ok) {
        console.error("Error fetching adult clients");
        setAllClients(youthClients);
        setFilteredClients(youthClients);
        return;
      }

      const json2 = await res2.json();
      const adultClients = json2.data || [];
      const allClientsList = [...youthClients, ...adultClients].sort(
        (a, b) => new Date(b.dateModified || 0) - new Date(a.dateModified || 0),
      );

      setAllClients(allClientsList);
      setFilteredClients(allClientsList);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setAllClients([]);
      setFilteredClients([]);
    }
  };

  const fetchAdvocates = async () => {
    try {
      const res = await fetch(`/api/advocates`);

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error(
          "Error fetching advocates:",
          json?.error || `Status ${res.status}`,
        );
        setAdvocates([]);
        return;
      }

      const json = await res.json();
      const advocatesList = json.advocates || [];
      setAllAdvocates(advocatesList);
      setAdvocates(advocatesList);
    } catch (err) {
      console.error("Unexpected error:", err);
      setAllAdvocates([]);
      setAdvocates([]);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchAdvocates();
  }, []);

  // Instant client search
  useEffect(() => {
    filterClients(searchClient);
  }, [searchClient, allClients]);

  // Instant advocate search
  useEffect(() => {
    filterAdvocates(searchAdvocate);
  }, [searchAdvocate, allAdvocates]);

  const handleSearchClientChange = (event) => {
    setSearchClient(event.target.value);
  };

  const handleSearchAdvocateChange = (event) => {
    setSearchAdvocate(event.target.value);
  };

  const handleAssignAdvocate = async (e) => {
    e.preventDefault();

    if (!selectedClient || !selectedAdvocate) {
      setMessage("Please select both a client and an advocate.");
      setShowPopup(true);
      return;
    }

    try {
      const res = await fetch("/api/assigned-advocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient.client_id,
          advocate_id: selectedAdvocate,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMessage("Failed to assign advocate: " + (json.error || res.status));
        setShowPopup(true);
        return;
      }

      if (json.alreadyAssigned) {
        setMessage("This client is already assigned to the selected advocate.");
        setShowPopup(true);
        setIsAssigned(true);
        return;
      }

      setMessage("Client successfully assigned to the selected Advocate.");
      setShowPopup(true);

      // Update client status to 'Active' after successful assignment
      await updateClientStatus(selectedClient.client_id);

      // Reset selection and fetch fresh data
      setSelectedClient(null);
      setSelectedAdvocate("");
      fetchClients();
      fetchAdvocates();
    } catch (err) {
      setMessage("Failed to assign advocate: " + err.message);
      setShowPopup(true);
    }
  };
  // Function to clear the form
  const handleClearForm = () => {
    setSearchClient("");
    setSearchAdvocate("");
    setSelectedClient(null);
    setSelectedAdvocate("");
    setMessage("");
    setShowPopup(false);
    setIsAssigned(false);
  };

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[580px]">

      {/* Header */}
      <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
        Assign Client to Advocate
      </div>

      <div className="p-6">
        <form onSubmit={handleAssignAdvocate} className="space-y-5">

          {/* Client Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Search for Client
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchClient}
                onChange={handleSearchClientChange}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Client results */}
          {filteredClients.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <div
                  key={client.client_id}
                  onClick={() => setSelectedClient(client)}
                  className="px-3 py-2.5 cursor-pointer transition-colors text-sm"
                  style={{ backgroundColor: selectedClient?.client_id === client.client_id ? "#F0EEF6" : "" }}
                  onMouseEnter={(e) => { if (selectedClient?.client_id !== client.client_id) e.currentTarget.style.backgroundColor = "#F8F7FC"; }}
                  onMouseLeave={(e) => { if (selectedClient?.client_id !== client.client_id) e.currentTarget.style.backgroundColor = ""; }}
                >
                  <p className="font-medium text-gray-800">{client.firstName} {client.middleName} {client.lastName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Status: {client.clientStatus}</p>
                </div>
              ))}
            </div>
          )}
          {searchClient.trim() && filteredClients.length === 0 && (
            <div className="flex flex-col items-center py-6 text-gray-400">
              <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-sm font-medium">No clients found.</p>
              <p className="text-xs mt-1">Try adjusting your search</p>
            </div>
          )}

          {/* Selected client */}
          {selectedClient && (
            <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: "#F0EEF6", borderColor: "#B2B3D7" }}>
              <p className="font-semibold" style={{ color: "#47315E" }}>
                Selected: {selectedClient.firstName} {selectedClient.lastName}
              </p>
            </div>
          )}

          {/* Advocate Search */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Search for Advocate
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by advocate name..."
                value={searchAdvocate}
                onChange={handleSearchAdvocateChange}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-700 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Advocate results */}
          {advocates.length > 0 && (
            <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto divide-y divide-gray-100">
              {advocates.map((advocate) => (
                <div
                  key={advocate.advocate_id}
                  onClick={() => setSelectedAdvocate(advocate.advocate_id)}
                  className="px-3 py-2.5 cursor-pointer transition-colors text-sm"
                  style={{ backgroundColor: selectedAdvocate === advocate.advocate_id ? "#F0EEF6" : "" }}
                  onMouseEnter={(e) => { if (selectedAdvocate !== advocate.advocate_id) e.currentTarget.style.backgroundColor = "#F8F7FC"; }}
                  onMouseLeave={(e) => { if (selectedAdvocate !== advocate.advocate_id) e.currentTarget.style.backgroundColor = ""; }}
                >
                  <p className="font-medium text-gray-800">{advocate.firstName} {advocate.lastName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{advocate.email}</p>
                </div>
              ))}
            </div>
          )}
          {searchAdvocate.trim() && advocates.length === 0 && (
            <div className="flex flex-col items-center py-6 text-gray-400">
              <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <p className="text-sm font-medium">No advocates found.</p>
              <p className="text-xs mt-1">Try adjusting your search</p>
            </div>
          )}

          {/* Selected advocate */}
          {selectedAdvocate && (
            <div className="p-3 rounded-lg border text-sm" style={{ backgroundColor: "#F0EEF6", borderColor: "#B2B3D7" }}>
              <p className="font-semibold" style={{ color: "#47315E" }}>
                Selected: {advocates.find(a => a.advocate_id === selectedAdvocate)?.firstName} {advocates.find(a => a.advocate_id === selectedAdvocate)?.lastName}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={isAssigned}
              className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#B2B3D7", borderColor: "#9899C0", color: "#47315E" }}
              onMouseEnter={(e) => { if (!isAssigned) e.currentTarget.style.backgroundColor = "#9899C0"; }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#B2B3D7"}
            >
              Assign Advocate
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="w-full py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>

        </form>
      </div>

      {/* Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-6 py-4" style={{ backgroundColor: "#47315E" }}>
              <h3 className="text-base font-semibold text-white">Assignment Status</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-700">{message}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
              <button
                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                style={{ backgroundColor: "#47315E" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3a2649"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#47315E"}
                onClick={() => setShowPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
