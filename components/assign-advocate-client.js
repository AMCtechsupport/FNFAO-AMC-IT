"use client";

import { updateClientStatus } from "./client-active";
import { useState, useEffect, useRef } from "react";
import supabase from "../src/app/lib/supabase";

export default function AssignAdvocate({
  clients: initialClients = [],
  advocates: initialAdvocates = [],
}) {
  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [searchAdvocate, setSearchAdvocate] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAdvocate, setSelectedAdvocate] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);
  const searchClientTimeoutRef = useRef(null);
  const searchAdvocateTimeoutRef = useRef(null);
  const isFirstRenderRef = useRef(true);

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

  const fetchAdvocates = async (searchQuery = "") => {
    try {
      const params = searchQuery
        ? `?search=${encodeURIComponent(searchQuery)}`
        : "";
      const res = await fetch(`/api/advocates${params}`);

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
      setAdvocates(json.advocates || []);
    } catch (err) {
      console.error("Unexpected error:", err);
      setAdvocates([]);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Debounced client search
  useEffect(() => {
    if (searchClientTimeoutRef.current) {
      clearTimeout(searchClientTimeoutRef.current);
    }

    searchClientTimeoutRef.current = setTimeout(() => {
      filterClients(searchClient);
    }, 300);

    return () => {
      if (searchClientTimeoutRef.current) {
        clearTimeout(searchClientTimeoutRef.current);
      }
    };
  }, [searchClient, allClients]);

  // Debounced advocate search (skip debounce on first render)
  useEffect(() => {
    // On first render, fetch without debounce
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      fetchAdvocates(searchAdvocate);
      return;
    }

    // On subsequent renders, apply debounce
    if (searchAdvocateTimeoutRef.current) {
      clearTimeout(searchAdvocateTimeoutRef.current);
    }

    searchAdvocateTimeoutRef.current = setTimeout(() => {
      fetchAdvocates(searchAdvocate);
    }, 300);

    return () => {
      if (searchAdvocateTimeoutRef.current) {
        clearTimeout(searchAdvocateTimeoutRef.current);
      }
    };
  }, [searchAdvocate]);

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
      // Check if the client has already been assigned to the advocate
      const { data, error } = await supabase
        .from("Assigned Advocates")
        .select("*")
        .eq("client_id", selectedClient.client_id)
        .eq("advocate_id", selectedAdvocate);

      if (error) {
        console.error("Error checking for existing assignment:", error.message);
      }

      // If data is not empty, that means the client is already assigned to this advocate
      if (data.length > 0) {
        setMessage("This client is already assigned to the selected advocate.");
        setShowPopup(true);
        setIsAssigned(true);
        return;
      }

      // Proceed with assigning if not already assigned
      const { insertData, insertError } = await supabase
        .from("Assigned Advocates")
        .insert([
          {
            client_id: selectedClient.client_id,
            advocate_id: selectedAdvocate,
          },
        ]);

      if (insertError) {
        setMessage("Failed to assign advocate: " + insertError.message);
        setShowPopup(true);
      } else {
        setMessage("Client successfully assigned to the selected Advocate.");
        setShowPopup(true);

        // Update client status to 'Active' after successful assignment
        await updateClientStatus(selectedClient.client_id);

        // Reset selection and fetch fresh data
        setSelectedClient(null);
        setSelectedAdvocate("");
        fetchClients();
        fetchAdvocates();
      }
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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg border ">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Assign Client to Advocate
      </h2>

      <form onSubmit={handleAssignAdvocate} className="space-y-6">
        {/* Client Search */}
        <div className="flex flex-col border-black pb-4">
          <label className="mb-2 text-lg font-semibold text-gray-700">
            Search for Client
          </label>
          <input
            type="text"
            placeholder="Search by Name"
            value={searchClient}
            onChange={handleSearchClientChange}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Display search results for clients */}
        {filteredClients.length > 0 && (
          <div className="mt-4 border-2  rounded-lg p-4 max-h-96 bg-gray-200 overflow-y-auto">
            <ul>
              {filteredClients.map((client) => (
                <li
                  key={client.client_id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    selectedClient?.client_id === client.client_id
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <span className="font-semibold">
                    {client.firstName} {client.middleName} {client.lastName}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    {client.phoneNumber} {client.firstNationMembership} |{" "}
                    {new Date(client.dateOfBirth).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>

                  <span className="text-sm text-gray-600 block">
                    Client Status: {client.clientStatus}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* If a client is selected, show their info */}
        {selectedClient && (
          <div className="mt-4 p-4 border border-black rounded-lg bg-gray-200">
            <p className="font-semibold text-blue-700">
              Selected Client: {selectedClient.firstName}{" "}
              {selectedClient.lastName}
            </p>
            <p className="text-sm text-gray-600">
              Client ID: {selectedClient.client_id}
            </p>
          </div>
        )}

        {/* Advocate Search */}
        <div className="flex flex-col border-black pt-4 pb-4 p-4">
          <label className="mb-2 text-lg font-semibold text-gray-700">
            Search for Advocate
          </label>
          <input
            type="text"
            placeholder="Search by Advocate Name"
            value={searchAdvocate}
            onChange={handleSearchAdvocateChange}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-600 mt-2">
            {advocates.length === 0 ? (
              <span className="text-orange-600">
                No advocates found. Check database connection.
              </span>
            ) : null}
          </p>
        </div>

        {/* Display search results for advocates */}
        {advocates.length > 0 && (
          <div className="mt-4 border-2 rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-200">
            <ul>
              {advocates.map((advocate) => (
                <li
                  key={advocate.advocate_id}
                  onClick={() => setSelectedAdvocate(advocate.advocate_id)}
                  className={`p-3 cursor-pointer hover:bg-gray-100 p-2 ${
                    selectedAdvocate === advocate.advocate_id
                      ? "bg-gray-100"
                      : ""
                  }`}
                >
                  <span className="font-semibold">
                    {advocate.firstName} {advocate.lastName}
                  </span>
                  <br />
                  <span className="text-sm text-gray-600">
                    Email: {advocate.email}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* If an advocate is selected, show their info */}
        {selectedAdvocate && (
          <div className="mt-4 p-4 border border-black rounded-lg bg-blue-50 bg-gray-200">
            <p className="font-semibold text-blue-700">
              Selected Advocate:{" "}
              {
                advocates.find(
                  (advocate) => advocate.advocate_id === selectedAdvocate,
                )?.firstName
              }{" "}
              {
                advocates.find(
                  (advocate) => advocate.advocate_id === selectedAdvocate,
                )?.lastName
              }
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-black rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2"
          disabled={isAssigned}
        >
          Assign Advocate
        </button>

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClearForm}
          className="w-full mt-4 py-3 bg-gray-400 text-black rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 p-2"
        >
          Clear Search
        </button>
      </form>

      {/* Modal Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <p>{message}</p>
            <button
              className="mt-4 bg-blue-500 text-white p-2 rounded-md"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
