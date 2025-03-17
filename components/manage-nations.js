"use client";

import React, { useState, useEffect } from "react";
import supabase from "@/app/lib/supabase"; // Adjust according to your file structure

const FirstNationManagement = () => {
  const [firstNations, setFirstNations] = useState([]);
  const [newFirstNation, setNewFirstNation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the current First Nations from Supabase when the component mounts
  useEffect(() => {
    const fetchFirstNations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("First Nations")
        .select("firstNationMembership");

      if (error) {
        setError("Error fetching first nations");
      } else {
        setFirstNations(data);
      }

      setIsLoading(false);
    };

    fetchFirstNations();
  }, []);

  // Handle adding a new First Nation to the table
  const handleAddFirstNation = async () => {
    if (newFirstNation.trim() === "") return;

    const { data, error } = await supabase
      .from("First Nations")
      .insert([{ firstNationMembership: newFirstNation }]);

    if (error) {
      setError("Error adding new First Nation");
    } else {
      setFirstNations([
        ...firstNations,
        { firstNationMembership: newFirstNation },
      ]);
      setNewFirstNation(""); // Clear the input after adding
    }
  };

  // Handle removing a First Nation from the table
  const handleRemoveFirstNation = async (firstNation) => {
    const { data, error } = await supabase
      .from("First Nations")
      .delete()
      .eq("firstNationMembership", firstNation);

    if (error) {
      setError("Error removing First Nation");
    } else {
      // Filter out the removed nation from the list
      setFirstNations(
        firstNations.filter(
          (nation) => nation.firstNationMembership !== firstNation
        )
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800">
        Manage First Nations
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
              Existing First Nations
            </h4>
            <ul className="space-y-2 mt-4">
              {firstNations.map((nation) => (
                <li
                  key={nation.firstNationMembership}
                  className="flex justify-between items-center p-3 bg-gray-100 rounded-lg shadow-sm"
                >
                  <span className="text-gray-800">
                    {nation.firstNationMembership}
                  </span>
                  <button
                    onClick={() =>
                      handleRemoveFirstNation(nation.firstNationMembership)
                    }
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
              value={newFirstNation}
              onChange={(e) => setNewFirstNation(e.target.value)}
              placeholder="Enter a new First Nation"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddFirstNation}
              className="mt-4 w-full p-3 bg-blue-600 text-black rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add New First Nation
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FirstNationManagement;
