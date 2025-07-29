"use client";

import { useState, useEffect } from "react";
import AssignAdvocate from "../../../components/assign-advocate-client";
import AssignClientSelector from "../../../components/assigned-client-selector";
import UserHome from "../user-home/page";
import supabase from "../lib/supabase";

export default function AssignPage() {
  const [clientsData, setClientsData] = useState([]);
  const [advocatesData, setAdvocatesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch clients and advocates
      const [clientsResponse, advocatesResponse] = await Promise.all([
        supabase.from("Clients").select("*"),
        supabase.from("Advocates").select("*")
      ]);

      if (clientsResponse.error) throw clientsResponse.error;
      if (advocatesResponse.error) throw advocatesResponse.error;

      setClientsData(clientsResponse.data || []);
      setAdvocatesData(advocatesResponse.data || []);
    } catch (err) {
      setError("Failed to fetch data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = () => {
    fetchData();
  };

  if (loading) {
    return (
      <UserHome>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading admin data...</div>
        </div>
      </UserHome>
    );
  }

  if (error) {
    return (
      <UserHome>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error: {error}</div>
          <button onClick={fetchData} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded">
            Retry
          </button>
        </div>
      </UserHome>
    );
  }

  return (
    <UserHome>
      <div className="assign-page-wrapper flex space-x-8">
        {/* Left side: AssignAdvocate component */}
        <div className="flex-1 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Assign Client to Advocate
          </h2>
          {/* Pass clients and advocates data as props to the AssignAdvocate component */}
          <AssignAdvocate 
            onAssignmentChange={refreshData}
          />
        </div>

        {/* Right side: AssignClientSelector component */}
        <div className="flex-1 p-4 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Select Advocate and View Clients
          </h2>
          {/* Render the AssignClientSelector to allow user to select an advocate and see assigned clients */}
          <AssignClientSelector 
            advocates={advocatesData} 
            onAssignmentChange={refreshData}
          />
        </div>
      </div>
    </UserHome>
  );
}
