/*
This component fetches and displays a list of clients 
filtered by age group or date of birth range.
*/

"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "@/app/lib/supabase";

// Convert Date object to 'YYYY-MM-DD' format
function formatYYYYMMDD(d) {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get the date N years ago from today
function yearsAgo(n) {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear() - n, today.getUTCMonth(), today.getUTCDate()));
}

// Map age group to date of birth range
function getDOBRangeFromAgeGroup(ageGroup) {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  switch (ageGroup) {
    case "0-18":
      return {
        minDOB: formatYYYYMMDD(yearsAgo(18)),
        maxDOB: formatYYYYMMDD(todayUTC),
      };
    case "19-35":
      return {
        minDOB: formatYYYYMMDD(yearsAgo(35)),
        maxDOB: formatYYYYMMDD(yearsAgo(19)),
      };
    case "36-60":
      return {
        minDOB: formatYYYYMMDD(yearsAgo(60)),
        maxDOB: formatYYYYMMDD(yearsAgo(36)),
      };
    case "60+":
      return {
        minDOB: "",
        maxDOB: formatYYYYMMDD(yearsAgo(60)),
      };
    default:
      return { minDOB: "", maxDOB: "" };
  }
}

// Calculate age from date of birth
function CalculateAge(dob) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function AgeSelectionFilter() {
  const searchParams = useSearchParams();

  const ageGroup = searchParams.get("ageGroup") || "";
  const minDOBParam = searchParams.get("minDOB") || "";
  const maxDOBParam = searchParams.get("maxDOB") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || ""; 
  const quarter = searchParams.get("quarter") || "";

  const derived = getDOBRangeFromAgeGroup(ageGroup);
  const effectiveMinDOB = minDOBParam || derived.minDOB;
  const effectiveMaxDOB = maxDOBParam || derived.maxDOB;

  const [clients, setClients] = useState([]);
  const [error, setError] = useState(null);

  /* Fetch clients based on age group or date of birth range */

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let query = supabase.from("Clients").select("client_id, firstName, lastName, dateOfBirth, createdAt");

        if (effectiveMinDOB) query = query.gte("dateOfBirth", effectiveMinDOB);
        if (effectiveMaxDOB) query = query.lte("dateOfBirth", effectiveMaxDOB);

        // Quarter/Date range filter on createdAt
        if (startDate) query = query.gte("createdAt", startDate);
        if (endDate) query = query.lte("createdAt", endDate);

        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;

        setClients(data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching clients:", err.message || err);
        setError("Failed to fetch clients. Please try again later.");
      }
    };

    fetchClients();
  }, [effectiveMinDOB, effectiveMaxDOB, startDate, endDate]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {quarter && (
        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
          <p className="text-blue-800 font-semibold">Filtered by: {quarter}</p>
        </div>
      )}

      {error && (
        <p className="text-red-600 font-medium mb-4 text-center">{error}</p>
      )}

      {!error && clients.length === 0 && (
        <p className="text-gray-500 text-center">No matching clients found.</p>
      )}

      {clients.length > 0 && (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
          <thead className="bg-indigo-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Age</th>
            </tr>
          </thead>
          {/* It shows the client name and calculated age */}
          <tbody>
            {clients.map((client) => (
              <tr key={client.client_id}>
                <td className="border border-gray-300 px-4 py-2">
                  {client.firstName} {client.lastName}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {CalculateAge(client.dateOfBirth)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}