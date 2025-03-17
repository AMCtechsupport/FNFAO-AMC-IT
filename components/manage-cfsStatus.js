"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/app/lib/supabase";

const CFSStatusManagement = () => {
  const [cfsStatuses, setCfsStatuses] = useState([]);
  const [newCfsStatus, setNewCfsStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the current CFS Statuses from Supabase when the component mounts
  useEffect(() => {
    const fetchCfsStatuses = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("CFS Status")
        .select("cfsStatus");

      if (error) {
        setError("Error fetching CFS statuses");
        console.error("Error fetching CFS statuses:", error);
      } else {
        setCfsStatuses(data);
      }

      setIsLoading(false);
    };

    fetchCfsStatuses();
  }, []);

  // Handle adding a new CFS Status to the table
  const handleAddCfsStatus = async () => {
    if (newCfsStatus.trim() === "") return;

    const { data, error } = await supabase
      .from("CFS Status") //
      .insert([{ cfsStatus: newCfsStatus }]);

    if (error) {
      setError("Error adding new CFS Status");
      console.error("Error adding new CFS Status:", error);
    } else {
      setCfsStatuses([...cfsStatuses, { cfsStatus: newCfsStatus }]);
      setNewCfsStatus(""); //
    }
  };

  // Handle removing a CFS Status from the table
  const handleRemoveCfsStatus = async (cfsStatus) => {
    const { data, error } = await supabase
      .from("CFS Status")
      .delete()
      .eq("cfsStatus", cfsStatus);

    if (error) {
      setError("Error removing CFS Status");
      console.error("Error removing CFS Status:", error);
    } else {
      // Filter out the removed status from the list
      setCfsStatuses(
        cfsStatuses.filter((status) => status.cfsStatus !== cfsStatus)
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800">
        Manage CFS Statuses
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
              Existing CFS Statuses
            </h4>
            <ul className="space-y-2 mt-4">
              {cfsStatuses.map((status) => (
                <li
                  key={status.cfsStatus}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                >
                  <span className="text-gray-800">{status.cfsStatus}</span>
                  <button
                    onClick={() => handleRemoveCfsStatus(status.cfsStatus)}
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
              value={newCfsStatus}
              onChange={(e) => setNewCfsStatus(e.target.value)}
              placeholder="Enter a new CFS Status"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddCfsStatus}
              className="mt-4 w-full p-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New CFS Status
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CFSStatusManagement;
