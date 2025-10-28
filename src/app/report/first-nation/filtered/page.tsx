"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "@/app/lib/supabase";
import UserHome from "@/app/user-home/page";
import ReportPreview from "../../../../../components/report/report-preview";

// Convert Date YYYY-MM-DD
function formatYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get the date N years ago
function yearsAgo(n: number): Date {
  const today = new Date();
  return new Date(
    Date.UTC(
      today.getUTCFullYear() - n,
      today.getUTCMonth(),
      today.getUTCDate()
    )
  );
}

// Map age group Date of Birth
function getDOBRangeFromAgeGroup(ageGroup: string) {
  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );

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
      return { minDOB: "", maxDOB: formatYYYYMMDD(yearsAgo(60)) };
    default:
      return { minDOB: "", maxDOB: "" };
  }
}

function calculateAge(dob?: string): number | string {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate()))
    age--;
  return age;
}

export default function ClientFilterPage() {
  const searchParams = useSearchParams();

  const community = searchParams.get("community") || "";
  const agency = searchParams.get("agency") || "";
  const ageGroup = searchParams.get("ageGroup") || "";

  const { minDOB, maxDOB } = getDOBRangeFromAgeGroup(ageGroup);

  const [showPreview, setShowPreview] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let query = supabase
          .from("Clients")
          .select(
            "client_id, firstName, lastName, cfsAgency, firstNationMembership, dateOfBirth"
          );

        // Apply filters dynamically
        if (community) query = query.eq("firstNationMembership", community);
        if (agency) query = query.eq("cfsAgency", agency);
        if (minDOB) query = query.gte("dateOfBirth", minDOB);
        if (maxDOB) query = query.lte("dateOfBirth", maxDOB);

        const { data, error } = await query;

        if (error) throw error;
        setClients(data || []);
        setFetchError(null);
      } catch (err: any) {
        console.error("Error fetching clients:", err.message || err);
        setFetchError("Failed to fetch clients. Please try again later.");
      }
    };

    fetchClients();
  }, [community, agency, ageGroup, minDOB, maxDOB]);

  // Handles opening the report preview modal
  const handleOpenPreview = () => setShowPreview(true);

  // Handles closing the report preview modal
  const handleClosePreview = () => setShowPreview(false);

  return (
    <UserHome>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Generate Report
        </h1>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {community && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white rounded-full">
              Community: {community}
            </span>
          )}
          {agency && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white rounded-full">
              Agency: {agency}
            </span>
          )}
          {ageGroup && (
            <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white rounded-full">
              Age Group: {ageGroup}
            </span>
          )}
        </div>

        {fetchError && (
          <p className="text-red-600 font-medium text-center mb-4">
            {fetchError}
          </p>
        )}

        {!fetchError && clients.length === 0 && (
          <p className="text-gray-500 text-center">
            No matching clients found.
          </p>
        )}

        {clients.length > 0 && (
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-indigo-100">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Age</th>
                <th className="px-4 py-2 border">CFS Agency</th>
                <th className="px-4 py-2 border">First Nation</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.client_id} className="text-center">
                  <td className="px-4 py-2 border">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="px-4 py-2 border">
                    {calculateAge(client.dateOfBirth)}
                  </td>
                  <td className="px-4 py-2 border">{client.cfsAgency}</td>
                  <td className="px-4 py-2 border">
                    {client.firstNationMembership}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Download All
          </h2>

          <button
            type="button"
            onClick={handleOpenPreview}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            Download All
          </button>
        </div>
      </div>
      {/* Report Preview Modal */}
      {showPreview && (
        <ReportPreview onClose={handleClosePreview}>
          <h2>Download All - Filtered Clients</h2>
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {community && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white rounded-full">
                Community: {community}
              </span>
            )}
            {agency && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white rounded-full">
                Agency: {agency}
              </span>
            )}
            {ageGroup && (
              <span className="px-3 py-1 bg-gradient-to-r from-purple-400 to-indigo-600 text-white rounded-full">
                Age Group: {ageGroup}
              </span>
            )}
          </div>

          {fetchError && (
            <p className="text-red-600 font-medium text-center mb-4">
              {fetchError}
            </p>
          )}

          {!fetchError && clients.length === 0 && (
            <p className="text-gray-500 text-center">
              No matching clients found.
            </p>
          )}

          {clients.length > 0 && (
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Age</th>
                  <th className="px-4 py-2 border">CFS Agency</th>
                  <th className="px-4 py-2 border">First Nation</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.client_id} className="text-center">
                    <td className="px-4 py-2 border">
                      {client.firstName} {client.lastName}
                    </td>
                    <td className="px-4 py-2 border">
                      {calculateAge(client.dateOfBirth)}
                    </td>
                    <td className="px-4 py-2 border">{client.cfsAgency}</td>
                    <td className="px-4 py-2 border">
                      {client.firstNationMembership}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ReportPreview>
      )}
    </UserHome>
  );
}
