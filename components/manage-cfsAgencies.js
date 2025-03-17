"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/app/lib/supabase"; // Adjust according to your file structure

const CFSAgenciesManagement = () => {
  const [cfsAgencies, setCfsAgencies] = useState([]); // Changed to cfsAgencies
  const [newCfsAgency, setNewCfsAgency] = useState(""); // Changed to newCfsAgency
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the current CFS Agencies from Supabase when the component mounts
  useEffect(() => {
    const fetchCfsAgencies = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("CFS Agencies") // Table name changed to "CFS Agencies"
        .select("agencyName"); // Field changed to agencyName

      if (error) {
        setError("Error fetching CFS agencies");
        console.error("Error fetching CFS agencies:", error);
      } else {
        setCfsAgencies(data); // Store the result
      }

      setIsLoading(false);
    };

    fetchCfsAgencies();
  }, []);

  // Handle adding a new CFS Agency to the table
  const handleAddCfsAgency = async () => {
    if (newCfsAgency.trim() === "") return;

    const { data, error } = await supabase
      .from("CFS Agencies") // Table name changed to "CFS Agencies"
      .insert([{ agencyName: newCfsAgency }]); // Field changed to agencyName

    if (error) {
      setError("Error adding new CFS Agency");
      console.error("Error adding new CFS Agency:", error);
    } else {
      setCfsAgencies([...cfsAgencies, { agencyName: newCfsAgency }]);
      setNewCfsAgency(""); // Clear the input after adding
    }
  };

  // Handle removing a CFS Agency from the table
  const handleRemoveCfsAgency = async (agencyName) => {
    const { data, error } = await supabase
      .from("CFS Agencies") // Table name changed to "CFS Agencies"
      .delete()
      .eq("agencyName", agencyName); // Field changed to agencyName

    if (error) {
      setError("Error removing CFS Agency");
      console.error("Error removing CFS Agency:", error);
    } else {
      // Filter out the removed agency from the list
      setCfsAgencies(
        cfsAgencies.filter((agency) => agency.agencyName !== agencyName)
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800">
        Manage CFS Agencies
      </h3>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {error && (
            <div className="text-red-600 font-medium text-center">{error}</div>
          )}

          <div>
            <h4 className="text-xl font-medium text-gray-700">
              Existing CFS Agencies
            </h4>
            <ul className="space-y-2 mt-4">
              {cfsAgencies.map((agency) => (
                <li
                  key={agency.agencyName}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                >
                  <span className="text-gray-800">{agency.agencyName}</span>
                  <button
                    onClick={() => handleRemoveCfsAgency(agency.agencyName)}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <input
              type="text"
              value={newCfsAgency}
              onChange={(e) => setNewCfsAgency(e.target.value)}
              placeholder="Enter a new CFS Agency"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCfsAgency}
              className="mt-4 w-full p-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New CFS Agency
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CFSAgenciesManagement;
