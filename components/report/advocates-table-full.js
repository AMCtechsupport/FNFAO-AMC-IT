/*
This component fetches and displays a full advocates report table
with options to download the data in JSON or CSV format.
*/

"use client";

import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

export const downloadJSON = (data, filename = "advocates_report") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export const downloadCSV = (data, filename = "advocates_report") => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName])).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export default function AdvocatesTableFull({ onDataLoaded, active, inactive, startDate, endDate }) { 
  const [advocates, setAdvocates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  function clientType() {
    if (active && inactive) return null;
    if (active && !inactive) return "Active";
    if (!active && inactive) return "Inactive";
    return "__NONE__";
  }

  useEffect(() => {
    const fetchAdvocates = async () => {
      setLoading(true);
      try {
        const { data: advocatesData, error: advocatesError } = await supabase
          .from("Advocates")
          .select("advocate_id, firstName, lastName");

        if (advocatesError) throw advocatesError;

        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from("Assigned Advocates")
          .select("advocate_id, client_id");

        if (assignmentsError) throw assignmentsError;

        const status = clientType();
        let clientsData = [];
        let clientsError = null;

        if (status === "__NONE__") {
          clientsData = [];
        } else {
          let clientsQuery = supabase
            .from("Clients")
            .select("client_id, clientStatus, createdAt"); // added createdAt here

          if (status) {
            clientsQuery = clientsQuery.eq("clientStatus", status);
          }

          // apply date range filters when provided
          if (startDate) {
            clientsQuery = clientsQuery.gte('createdAt', startDate);
          }
          if (endDate) {
            clientsQuery = clientsQuery.lte('createdAt', endDate);
          }

          const clientsResult = await clientsQuery;
          clientsData = clientsResult.data;
          clientsError = clientsResult.error;
        }

        if (clientsError) throw clientsError;

        const activeClientIds = new Set((clientsData || []).map((client) => client.client_id));

        // default: 4 months timeframe if no explicit range provided
        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

        const mergedData = advocatesData.map((advocate) => {
          const assignedClients = assignmentsData.filter(
            (item) => item.advocate_id === advocate.advocate_id && activeClientIds.has(item.client_id)
          );

          const clientCount = assignedClients.length;

          // calculate new clients
          const newClientCount = assignedClients.filter((item) => {
            const cl = clientsData.find(c => c.client_id === item.client_id);
            const createdAt = cl?.createdAt ? new Date(cl.createdAt) : null;
            if (!createdAt) return false;

            if (startDate || endDate) {
              const start = startDate ? new Date(startDate) : new Date(0);
              const end = endDate ? new Date(endDate) : new Date();
              return createdAt >= start && createdAt <= end;
            }

            return createdAt >= fourMonthsAgo;
          }).length;

          return {
            advocate_id: advocate.advocate_id,
            name: `${advocate.firstName} ${advocate.lastName}`,
            clientCount: clientCount,
            newClientCount 
          };
        });

        setAdvocates(mergedData);
        if (onDataLoaded) onDataLoaded(mergedData);

      } catch (err) {
        console.error("Error fetching advocates:", err);
        setFetchError("Failed to load advocates");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, [active, inactive, startDate, endDate, onDataLoaded]); 

  if (loading) return <p className="text-center text-gray-500">Loading advocates...</p>;
  if (fetchError) return <p className="text-center text-red-500">{fetchError}</p>;
  if (advocates.length === 0) return <p className="text-center text-gray-500">No advocates found.</p>;

  return (
    <div className="overflow-x-auto">
      <div className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl">
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Advocate Name
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Number of Clients in Service
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Number of New Clients
              </th>
            </tr>
          </thead>

          <tbody>
            {advocates.map((advocate, index) => (
              <tr key={index}>
                <td className="px-6 py-3 border-b text-center">{advocate.name}</td>
                <td className="px-6 py-3 border-b text-center">{advocate.clientCount}</td>
                <td className="px-6 py-3 border-b text-center">{advocate.newClientCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}