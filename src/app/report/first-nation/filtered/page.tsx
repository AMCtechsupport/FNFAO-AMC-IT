/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import supabase from "@/app/lib/supabase";
import UserHome from "@/app/user-home/page";
import { useRouter } from "next/navigation";
import DownloadDropdown from "../../../../../components/report/download-dropdown";
import ReportPreview from "../../../../../components/report/report-preview";

// Convert Date YYYY-MM-DD
function formatYYYYMMDD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get the date N years ago
function yearsAgo(year: number): Date {
  const today = new Date();
  return new Date(Date.UTC(today.getUTCFullYear() - year, today.getUTCMonth(), today.getUTCDate()));
}

// Map age group Date of Birth
function getDOBRangeFromAgeGroup(ageGroup: string) {
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
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export default function ClientFilterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const community = searchParams.get("community") || "";
  const agency = searchParams.get("agency") || "";
  const ageGroup = searchParams.get("ageGroup") || "";
  const startDate = searchParams.get("startDate") || "";
  const endDate = searchParams.get("endDate") || "";
  const quarter = searchParams.get("quarter") || "";

  const { minDOB, maxDOB } = getDOBRangeFromAgeGroup(ageGroup);

  const [showPreview, setShowPreview] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv" | "json">(
          "pdf"
      );
  const [clients, setClients] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        let query = supabase
          .from("Clients")
          .select(`
            client_id,
            firstName,
            lastName,
            cfsAgency,
            firstNationMembership,
            dateOfBirth,
            createdAt,
            clientStatus,
            Childs(count)
          `);

        // Filters
        if (community) query = query.eq("firstNationMembership", community);
        if (agency) query = query.eq("cfsAgency", agency);
        if (minDOB) query = query.gte("dateOfBirth", minDOB);
        if (maxDOB) query = query.lte("dateOfBirth", maxDOB);
        if (startDate) query = query.gte("createdAt", startDate);
        if (endDate) query = query.lte("createdAt", endDate);

        const { data, error } = await query;

        if (error) throw error;

        const formatted = (data || []).map((client) => ({
          ...client,
          childCount: client.Childs?.[0]?.count ?? 0,
        }));

        setClients(formatted);
        setFetchError(null);
      } catch {
        setFetchError("Failed to fetch clients. Please try again later.");
      }
    };

    fetchClients();
  }, [community, agency, ageGroup, minDOB, maxDOB, startDate, endDate, quarter]);

  const handleClosePreview = () => setShowPreview(false);
  const handleDownloadAll = (format: "pdf" | "csv" | "json") => {
    setDownloadFormat(format);
    setShowPreview(true);
  };
  const handleRowClick = (clientId: string) => router.push(`/report/clients-report/${clientId}`);

  const setClientStatus = (status: string): string => status === "Active" ? "Active" : "Inactive";

  return (
    <UserHome>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Generate Report</h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {community && <span className="tag">Community: {community}</span>}
          {agency && <span className="tag">Agency: {agency}</span>}
          {ageGroup && <span className="tag">Age Group: {ageGroup}</span>}
          {quarter && <span className="tag">Filtered by: {quarter}</span>}
        </div>

        {fetchError && <p className="text-red-600 font-medium text-center mb-4">{fetchError}</p>}
        {!fetchError && clients.length === 0 && <p className="text-center text-gray-600 text-lg">No matching clients found.</p>}

        {/* Table */}
        {clients.length > 0 && (
          <table className="w-full border bg-white border-gray-200 rounded-xl">
            <thead className="bg-indigo-500 text-white text-left">
              <tr>
                <th className="px-6 py-3 font-medium text-center">Name</th>
                <th className="px-6 py-3 font-medium text-center">Age</th>
                <th className="px-6 py-3 font-medium text-center">CFS Agency</th>
                <th className="px-6 py-3 font-medium text-center">First Nation Membership</th>
                <th className="px-6 py-3 font-medium text-center">Number of Children</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Date of Inactivity</th>
                <th className="px-6 py-3 font-medium text-center">Reason for Inactivity</th>
                <th className="px-6 py-3 font-medium text-center">Date Created</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.client_id} className="cursor-pointer hover:bg-indigo-50 text-center transition" onClick={() => handleRowClick(client.client_id)}>
                  <td className="px-6 py-3 border-t text-center">{client.firstName} {client.lastName}</td>
                  <td className="px-6 py-3 border-t text-center">{calculateAge(client.dateOfBirth)}</td>
                  <td className="px-6 py-3 border-t text-center">{client.cfsAgency}</td>
                  <td className="px-6 py-3 border-t text-center">{client.firstNationMembership}</td>
                  <td className="px-6 py-3 border-t text-center">{client.childCount}</td>
                  <td className="px-6 py-3 border-t text-center">{setClientStatus(client.clientStatus)}</td>
                  <td className="px-6 py-3 border-t text-center">-</td>
                  <td className="px-6 py-3 border-t text-center">-</td>
                  <td className="px-6 py-3 border-t text-center">{client.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Download */}
        {/* dropdown */}
                                <div className="mt-8 w-full max-w-sm mx-auto">
                                    <DownloadDropdown
                                        title="Download All"
                                        onDownloadSelect={handleDownloadAll}
                                        defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
                                    />
                                </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <ReportPreview onClose={handleClosePreview} childrenDownloadButton={undefined}>
          <h2 className="text-center font-bold text-lg">Download All - Filtered Clients</h2>

          {clients.length > 0 && (
            <table className="w-full border border-gray-200 rounded-xl mt-4">
              <thead className="bg-indigo-100">
                <tr>
                  <th className="px-6 py-3 font-medium text-center">Name</th>
                  <th className="px-6 py-3 font-medium text-center">Age</th>
                  <th className="px-6 py-3 font-medium text-center">CFS Agency</th>
                  <th className="px-6 py-3 font-medium text-center">First Nation Membership</th>
                  <th className="px-6 py-3 font-medium text-center">Number of Children</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-center">Date of Inactivity</th>
                  <th className="px-6 py-3 font-medium text-center">Reason for Inactivity</th>
                  <th className="px-6 py-3 font-medium text-center">Date Created</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.client_id} className="text-center">
                    <td className="px-6 py-3 border-t text-center">{client.firstName} {client.lastName}</td>
                    <td className="px-6 py-3 border-t text-center">{calculateAge(client.dateOfBirth)}</td>
                    <td className="px-6 py-3 border-t text-center">{client.cfsAgency}</td>
                    <td className="px-6 py-3 border-t text-center">{client.firstNationMembership}</td>
                    <td className="px-6 py-3 border-t text-center">{client.childCount}</td>
                    <td className="px-6 py-3 border-t text-center">{setClientStatus(client.clientStatus)}</td>
                    <td className="px-6 py-3 border-t text-center">-</td>
                    <td className="px-6 py-3 border-t text-center">-</td>
                    <td className="px-6 py-3 border-t text-center">{client.createdAt}</td>
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
