/*
This component shows the content of advocate details report
after clicking on a specific advocate from the advocates report page.
*/

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import UserHome from "@/app/user-home/page";
import { downloadCSV, downloadJSON } from "../../../../../components/report/advocates-table-full";
import useAdvocateData from "../../../../../components/report/use-advocate-data";
import ReportPreviewAdvocates from "../../../../../components/report/report-preview-advocates";
import DetailedClientsTable from "../../../../../components/report/detailed-clients-table";
import DownloadDropdown from "../../../../../components/report/download-dropdown";
import { useParams, useRouter, useSearchParams } from "next/navigation";


function formatDateTime(dateString: string) {
  if (!dateString) return "";
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


function getQuarterDateRangeLocal(year: string, quarter: string) {
  const y = Number(year);
  if (!y || !quarter) return { startDate: "", endDate: "" };

  let startMonth = 0;
  switch (quarter.toUpperCase()) {
    case "Q1":
      startMonth = 3;  // Apr-Jun
      break;
    case "Q2":
      startMonth = 6;  // Jul-Sep
      break;
    case "Q3":
      startMonth = 9;  // Oct-Dec
      break;
    case "Q4":
      startMonth = 0;  // Jan-Mar
      break;
    default:
      return { startDate: "", endDate: "" };
  }

  const start = new Date(Date.UTC(y, startMonth, 1));

  const endMonth = startMonth + 2;
  const end = new Date(Date.UTC(y, endMonth + 1, 0));

  const toISODate = (d: Date) => d.toISOString().split("T")[0];

  return { startDate: toISODate(start), endDate: toISODate(end) };
}

function isDateWithinRange(createdAt?: string, start?: string, end?: string) {
  if (!createdAt) return false;
  if (!start && !end) return true;
  try {
    const created = new Date(createdAt);
    const startDt = start ? new Date(`${start}T00:00:00.000Z`) : null;
    const endDt = end ? new Date(`${end}T23:59:59.999Z`) : null;

    if (startDt && created < startDt) return false;
    if (endDt && created > endDt) return false;
    return true;
  } catch {
    return false;
  }
}
export default function AdvocateDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reportData, setReportData] = useState<Client[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv" | "json">("pdf");

  const [activeCheck, setActiveCheck] = useState(true);
  const [inactiveCheck, setInactiveCheck] = useState(true);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [quarterYear, setQuarterYear] = useState<string>("");
  const [quarterName, setQuarterName] = useState<string>("");

  const contentRef = useRef<HTMLDivElement | null>(null);

  // fetch advocate data
  const { advocateName, clients = [], loading, error } = useAdvocateData(id);

  useEffect(() => {
    if (!searchParams) return;

    const s = searchParams.get("startDate") ?? "";
    const e = searchParams.get("endDate") ?? "";
    const qYear = searchParams.get("quarterYear") ?? "";
    const qName = searchParams.get("quarterName") ?? "";
    const active = searchParams.get("active");
    const inactive = searchParams.get("inactive");

    if (s) setStartDate(s);
    if (e) setEndDate(e);
    if (qYear) setQuarterYear(qYear);
    if (qName) setQuarterName(qName);

    if (active !== null) setActiveCheck(active === "true");
    if (inactive !== null) setInactiveCheck(inactive === "true");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()]);

  const effectiveDateRange = useMemo(() => {
    if (quarterYear && quarterName) {
      return getQuarterDateRangeLocal(quarterYear, quarterName);
    }
    return { startDate: startDate || "", endDate: endDate || "" };
  }, [quarterYear, quarterName, startDate, endDate]);

  const filteredClients = useMemo(() => {
    const list = (clients || []) as Client[];

    return list.filter((c) => {
      // status filtering
      const statusMatch =
        activeCheck && inactiveCheck
          ? true
          : activeCheck
          ? c.clientStatus === "Active"
          : inactiveCheck
          ? c.clientStatus !== "Active"
          : false;

      if (!statusMatch) return false;
      const { startDate: effStart, endDate: effEnd } = effectiveDateRange;
      if (effStart || effEnd) {
        return isDateWithinRange(c.createdAt, effStart || undefined, effEnd || undefined);
      }

      return true;
    });
  }, [clients, activeCheck, inactiveCheck, effectiveDateRange]);

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
        margin: 0,
        filename: `${advocateName || "advocate-report"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
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
          className="w-full text-white font-medium py-3 px-4 rounded-md mt-4"
          style={{ backgroundColor: "#6100D7" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a2649")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6100D7")}
        >
          Download PDF
        </button>
      );
    }

    return (
      <button
        onClick={handleFinalDownload}
        className="w-full text-white font-medium py-3 px-4 rounded-md mt-4"
        style={{ backgroundColor: "#6100D7" }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#3a2649")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6100D7")}
      >
        Download {downloadFormat.toUpperCase()}
      </button>
    );
  };

  const handleRowClick = (clientId: string) => {
    router.push(`/report/clients-report/${clientId}`);
  };

  if (loading)
    return <p className="text-center text-gray-600 mt-10 text-lg font-medium">Loading...</p>;

  if (error)
    return <p className="text-center text-red-600 mt-10 text-lg font-semibold">{error}</p>;

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{advocateName} Clients Report</h1>
            <p className="text-sm text-gray-500 mt-1">Advocate clients report</p>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <div className="flex gap-4 flex-wrap justify-center">
            <div>
              <strong>Filtered by:</strong>{" "}
              {quarterYear && quarterName
                ? `${quarterName}-${quarterYear}`
                : effectiveDateRange.startDate || effectiveDateRange.endDate
                ? `${effectiveDateRange.startDate || "—"} → ${effectiveDateRange.endDate || "—"}`
                : "None"}
            </div>
          </div>
        </div>

        <div>
          {(!clients || clients.length === 0) && (
            <p className="text-center text-gray-600 text-lg">This advocate has no clients.</p>
          )}

          {clients && clients.length > 0 && filteredClients.length === 0 && (
            <p className="text-center text-gray-600 text-lg">
              No clients match the selected filters.
            </p>
          )}

          {clients && clients.length > 0 && filteredClients.length > 0 && (
            <>
              <div
                className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl mt-4"
                style={{ maxHeight: "800px" }}
              >
                <table className="w-full border border-gray-200 rounded-xl">
                  <thead className="text-white text-left" style={{ backgroundColor: "#6100D7" }}>
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
                    {filteredClients.map((client) => (
                      <tr
                        key={client.client_id}
                        className="cursor-pointer hover:bg-gray-50 text-center transition"
                        onClick={() => handleRowClick(client.client_id)}
                      >
                        <td className="px-6 py-3 border-t">
                          {client.firstName} {client.lastName}
                        </td>
                        <td className="px-6 py-3 border-t">{calculateAge(client.dateOfBirth)}</td>
                        <td className="px-6 py-3 border-t">{client.cfsAgency}</td>
                        <td className="px-6 py-3 border-t">{client.firstNationMembership}</td>
                        <td className="px-6 py-3 border-t">{client.childCount}</td>
                        <td className="px-6 py-3 border-t">{client.clientStatus}</td>
                        <td className="px-6 py-3 border-t text-center">
                          {formatDateTime(client.createdAt || "")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8">
                <DownloadDropdown
                  title="Download All"
                  onDownloadSelect={handleDownloadAll}
                  defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
                />
              </div>
            </>
          )}
        </div>

        {/* Preview modal for downloads */}
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
      </main>
    </UserHome>
  );
}
