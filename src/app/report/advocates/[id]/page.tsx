/*
This component shows the content of advocate details report
after clicking on a specific advocate from the advocates report page.
*/

"use client";

import React, { useState, useRef } from "react";
import UserHome from "@/app/user-home/page";
import {
  downloadCSV,
  downloadJSON,
} from "../../../../../components/report/advocates-table-full";
import useAdvocateData from "../../../../../components/report/use-advocate-data";
import ReportPreviewAdvocates from "../../../../../components/report/report-preview-advocates";
import DetailedClientsTable from "../../../../../components/report/detailed-clients-table";
import DownloadDropdown from "../../../../../components/report/download-dropdown";
import { useParams, useRouter } from "next/navigation";


// Format createdAt YYYY-MM-DD 00.00pm
function formatDateTime(dateString: string) {
  const d = new Date(dateString);

  const date = d.toISOString().split("T")[0];

  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

  return `${date} ${time}`;
}

type Client = {
  client_id: string;
  firstName: string;
  lastName: string;
  clientStatus: string;
  childCount: number;
  dateOfBirth?: string;
  cfsAgency?: string;
  firstNationMembership?: string;
  dateOfInactivity?: string;
  reasonForInactivity?: string;
  createdAt?: string;
};

function calculateAge(dob?: string): number | string {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}
export default function AdvocateDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();

  const [reportData, setReportData] = useState<Client[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv" | "json">("pdf");
  const [activeCheck, setActiveCheck] = useState(true);
  const [inactiveCheck, setInactiveCheck] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const { advocateName, clients, loading, error } = useAdvocateData(id);

  const handleClosePreview = () => {
    setShowPreview(false);
    setReportData([]);
  };

  const handleDownloadAll = (format: "pdf" | "csv" | "json") => {
    setDownloadFormat(format);
    setShowPreview(true);
  };

  const generateAndDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    if (!contentRef.current) return;

    await html2pdf()
      .set({
        margin: 0.5,
        filename: `${advocateName || "report"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .from(contentRef.current)
      .save();

    handleClosePreview();
  };

  const handleFinalDownload = () => {
    if (downloadFormat === "csv") downloadCSV(reportData);
    if (downloadFormat === "json") downloadJSON(reportData);
    handleClosePreview();
  };

  const DynamicDownloadButton = () => {
    if (downloadFormat === "pdf") {
      return (
        <button
          onClick={generateAndDownloadPDF}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md mt-4"
        >
          Download PDF
        </button>
      );
    }

    return (
      <button
        onClick={handleFinalDownload}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md mt-4"
      >
        Download {downloadFormat.toUpperCase()}
      </button>
    );
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/report/clients-report/${clientId}`);
  };

  const setClientStatus = (status: string) =>
    status === "Active" ? "Active" : "Inactive";

  if (loading)
    return <p className="text-center text-gray-600 mt-10 text-lg font-medium">Loading...</p>;

  if (error)
    return <p className="text-center text-red-600 mt-10 text-lg font-semibold">{error}</p>;

  return (
    <UserHome>
      <div className="p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {advocateName} Clients Report
        </h1>

        {clients.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">No clients assigned.</p>
        ) : (
          <>
            <div className="flex gap-6 justify-center mb-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={activeCheck}
                  onChange={(e) => setActiveCheck(e.target.checked)}
                />
                Active users
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inactiveCheck}
                  onChange={(e) => setInactiveCheck(e.target.checked)}
                />
                Inactive users
              </label>
            </div>

            <div
              className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl mt-4"
              style={{ maxHeight: "800px" }}
            >
              <table className="w-full border border-gray-200 rounded-xl">
                <thead className="bg-indigo-500 text-white text-left">
                  <tr>
                    <th className="px-6 py-3 text-center">Name</th>
                    <th className="px-6 py-3 text-center">Age</th>
                    <th className="px-6 py-3 text-center">CFS Agency</th>
                    <th className="px-6 py-3 text-center">First Nation Membership</th>
                    <th className="px-6 py-3 text-center">Number of Children</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Date Created</th>
                  </tr>
                </thead>

                <tbody>
                  {(clients as Client[])
                    .filter((c) =>
                      activeCheck && inactiveCheck
                        ? true
                        : activeCheck
                        ? c.clientStatus === "Active"
                        : inactiveCheck
                        ? c.clientStatus !== "Active"
                        : false
                    )
                    .map((client) => (
                      <tr
                        key={client.client_id}
                        className="cursor-pointer hover:bg-indigo-50 text-center transition"
                        onClick={() => handleRowClick(client.client_id)}
                      >
                        <td className="px-6 py-3 border-t">{client.firstName} {client.lastName}</td>
                        <td className="px-6 py-3 border-t">{calculateAge(client.dateOfBirth)}</td>
                        <td className="px-6 py-3 border-t">{client.cfsAgency}</td>
                        <td className="px-6 py-3 border-t">{client.firstNationMembership}</td>
                        <td className="px-6 py-3 border-t">{client.childCount}</td>
                        <td className="px-6 py-3 border-t">{client.clientStatus}</td>
                        <td className="px-6 py-3 border-t text-center">{formatDateTime(client.createdAt || "")}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 w-full max-w-sm mx-auto">
              <DownloadDropdown
                title="Download All"
                onDownloadSelect={handleDownloadAll}
                defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
              />
            </div>
          </>
        )}
      </div>

      {showPreview && (
        <ReportPreviewAdvocates
          onClose={handleClosePreview}
          downloadFormat={downloadFormat}
          childrenDownloadButton={<DynamicDownloadButton />}
        >
          <div ref={contentRef}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">All Clients Preview</h2>
            <DetailedClientsTable
              advocateId={id}
              activeCheck={activeCheck}
              inactiveCheck={inactiveCheck}
              onDataReady={setReportData}
            />
          </div>
        </ReportPreviewAdvocates>
      )}
    </UserHome>
  );
}