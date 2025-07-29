"use client";

import { updateClientStatus } from "./client-active";
import { useState, useEffect } from "react";
import supabase from "../src/app/lib/supabase";

export default function AssignAdvocate({ onAssignmentChange }) {
  const [clients, setClients] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [searchClient, setSearchClient] = useState("");
  const [searchAdvocate, setSearchAdvocate] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedAdvocate, setSelectedAdvocate] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isAssigned, setIsAssigned] = useState(false);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchClients("");
    fetchAdvocates("");
  }, []);

  const fetchClients = async (searchQuery = "") => {
    try {
      let query = supabase
        .from("Clients")
        .select("*")
        .order("client_id", { ascending: false })
        .eq("clientStatus", "Inactive"); // Filter for inactive clients

      // If there's a search query, add search conditions
      if (searchQuery) {
        const isNumeric = !isNaN(searchQuery);
        if (isNumeric) {
          query = query.eq("client_id", parseInt(searchQuery, 10));
        } else {
          query = query.or(
            `firstName.ilike.%${searchQuery}%,middleName.ilike.%${searchQuery}%,lastName.ilike.%${searchQuery}%`
          );
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching clients:", error.message);
      } else {
        setClients(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const fetchAdvocates = async (searchQuery = "") => {
    try {
      let query = supabase.from("Advocates").select("*");

      if (searchQuery) {
        query = query.or(
          `firstName.ilike.%${searchQuery}%,lastName.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching advocates:", error.message);
      } else {
        setAdvocates(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchClients(searchClient);
    fetchAdvocates(searchAdvocate);
  }, [searchClient, searchAdvocate]);

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
        console.error("Error checking existing assignment:", error);
        setMessage("Error checking existing assignment: " + error.message);
        setShowPopup(true);
        return;
      }

      if (data && data.length > 0) {
        setMessage("This client is already assigned to the selected advocate.");
        setShowPopup(true);
        return;
      }

      // Insert the new assignment
      const { data: insertData, error: insertError } = await supabase
        .from("Assigned Advocates")
        .insert([
          {
            client_id: selectedClient.client_id,
            advocate_id: selectedAdvocate,
            dateAssigned: new Date().toISOString(),
          },
        ])
        .select();

      if (insertError) {
        setMessage("Failed to assign advocate: " + insertError.message);
        setShowPopup(true);
      } else {
        setMessage("Client successfully assigned to the selected Advocate.");
        setShowPopup(true);

        await updateClientStatus(selectedClient.client_id);

        // Reset selection
        setSelectedClient(null);
        setSelectedAdvocate("");

        // Refresh local data and notify parent
        fetchClients(searchClient);
        fetchAdvocates(searchAdvocate);
        if (onAssignmentChange) {
          onAssignmentChange();
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setMessage("An unexpected error occurred: " + err.message);
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
        {clients.length > 0 && (
          <div className="mt-4 border-2  rounded-lg p-4 max-h-96 bg-gray-200 overflow-y-auto">
            <div className="mb-3 pb-2 border-b border-gray-300">
              <h3 className="font-semibold text-gray-800">
                {searchClient ? "Search Results (Inactive Clients Only)" : "Inactive Clients (Ready for Assignment)"}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {searchClient 
                  ? "Showing inactive clients matching your search." 
                  : "Showing only inactive clients. Use search to find specific inactive clients."
                }
              </p>
            </div>
            <ul>
              {clients.map((client) => (
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
 
                    {client.firstNationMembership}
                  </span>

                  <span className="text-sm text-gray-600 block">
                    Type: {client.clientType || "Not specified"}
                  </span>

                  <span className="text-sm text-gray-600 block">
                    Status: {client.clientStatus}
                  </span>

                  <span className="text-sm text-gray-600 block">
                    Created: {client.createdAt ? new Date(client.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    }) : "Not available"}
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
                  (advocate) => advocate.advocate_id === selectedAdvocate
                )?.firstName
              }{" "}
              {
                advocates.find(
                  (advocate) => advocate.advocate_id === selectedAdvocate
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
          Clear Form
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
