"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import UserHome from "../../user-home/page";
import FirstNationFilters from "../../../../components/report/first-nation-filters";
import DateFilterPage from "../../../../components/report/date-range-filter.js";
import QuarterFilter from "../../../../components/report/quarterly-dropdown";
import ReportPreview from "../../../../components/report/report-preview";
import DataColumn from "../../../../components/data-collection/data-column";
import DownloadDropdown from "../../../../components/report/download-dropdown";
import { getQuarterDateRange } from "../../../../src/app/utils/quarter-utils";
import ClientReportPreview from "../../../../components/report/client-report-preview";
import {
  downloadCSV,
  downloadJSON,
} from "../../../../components/report/advocates-table-full";

type QuarterSelection = {
  year: string;
  quarter: string;
} | null;

export default function FirstNationsReportPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [community, setCommunity] = useState("");
  const [agency, setAgency] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quarter, setQuarter] = useState<QuarterSelection>(null); 
  const [validationError, setValidationError] = useState("");
  const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv" | "json">("pdf");

  const router = useRouter();
  const [reportData, setReportData] = useState<any[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // It will clear date range filter upon quarter selection
    const handleQuarterChange = (selection: QuarterSelection) => {
    setQuarter(selection);
    if (selection) {
      setStartDate("");
      setEndDate("");
    }
    setValidationError("");
  };

  // It will clear quarter filter upon date range selection
  const handleSetStartDate = (s: string) => {
    setStartDate(s);
    if (s) 
    setQuarter(null);
    setValidationError("");
  };

  const handleSetEndDate = (e: string) => {
    setEndDate(e);
    if (e) 
    setQuarter(null);
    setValidationError("");
  };

  // It handles the Find button click validation
  const handleFind = () => {
    const selectedDate = startDate && endDate;
    const selectedQuarter = quarter !== null;
    const selectedFilter = community || agency || ageGroup; 

    if (!selectedDate && !selectedFilter && !selectedQuarter) {
      setValidationError("Please select at least one filter to find.");
      return;
    }

    // Sends selected values to next page
    const filterParams = new URLSearchParams();
    if (community) filterParams.set("community", community);
    if (agency) filterParams.set("agency", agency);
    if (ageGroup) filterParams.set("ageGroup", ageGroup);

    // Handle quarter filter
    if (quarter) {
      const { startDate: qStart, endDate: qEnd } = getQuarterDateRange(
        quarter.year,
        quarter.quarter 
      );
      filterParams.set("startDate", qStart);
      filterParams.set("endDate", qEnd);
      filterParams.set("quarter", `${quarter.quarter}-${quarter.year}`);
    } else if (startDate && endDate) {
      // Use manual date range if quarter not selected
      filterParams.set("startDate", startDate);
      filterParams.set("endDate", endDate);
    }

    router.push(`/report/first-nation/filtered?${filterParams.toString()}`);

    setValidationError("");
  };
  // It handles opening the report preview modal
  const handleOpenPreview = () => setShowPreview(true);

  // Handles closing the report preview modal
  const handleClosePreview = () => {
    setShowPreview(false);
    setReportData([]);
  };

  // Handler to set download format and open preview
  const handleDownloadAll = (format: "pdf" | "csv" | "json") => {
    setDownloadFormat(format);
    setShowPreview(true);
  };

  const generateAndDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    if (!contentRef.current) return;

    // Get the DOM element and set PDF options
    const element = contentRef.current;
    const options = {
      margin: 0.5,
      filename: "first_nations_report.pdf", 
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in" as const,
        format: "letter" as const,
        orientation: "portrait" as const,
      },
    };

    // Generate and save the PDF
    await html2pdf().set(options).from(element).save();
    handleClosePreview();
  };

  const handleFinalDownload = () => {
    if (downloadFormat === "csv") {
      downloadCSV(reportData);
    } else if (downloadFormat === "json") {
      downloadJSON(reportData);
    }

    handleClosePreview();
  };

  const DynamicDownloadButton = () => {
    if (downloadFormat === "pdf") {
      return (
        <button
          type="button"
          onClick={generateAndDownloadPDF}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors mt-4"
        >
          Download PDF
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleFinalDownload}
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors mt-4"
      >
        Download {downloadFormat.toUpperCase()}
      </button>
    );
  };

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Client&apos;s Report
          </h1>

          {/* Filters and actions */}
          <div className="space-y-6 bg-white shadow-md rounded-2xl p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <FirstNationFilters
                type="Community"
                array={DataColumn("First Nations", "firstNationMembership")}
                value={community}
                onChange={setCommunity}
                required
              />
              <FirstNationFilters
                type="Agency"
                array={DataColumn("CFS Agencies", "agencyName")}
                value={agency}
                onChange={setAgency}
                required
              />
              <FirstNationFilters
                type="Age Group"
                array={["0-18", "19-35", "36-60", "60+"]}
                value={ageGroup}
                onChange={setAgeGroup}
                required
              />
            </div>

            {/* Quarter Filter */}
            <div className="max-w-4xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Filter by Quarter
              </h3>
              <QuarterFilter value={quarter} onChange={handleQuarterChange} />
            </div>

            {/* Imported Date range filter component */}
            <div className="max-w-4xl mx-auto">
              <DateFilterPage setStartDate={handleSetStartDate} setEndDate={handleSetEndDate} />
            </div>

            {validationError && (
              <div className="text-red-500 text-center">{validationError}</div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-6 w-full max-w-sm mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Find
                </h2>

                <button
                  type="button"
                  onClick={handleFind} // this will validate and open the preview
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  Find
                </button>
              </div>
              <DownloadDropdown
                title="Download All"
                onDownloadSelect={handleDownloadAll}
                defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Report Preview Modal */}
      {showPreview && (
        <ReportPreview onClose={handleClosePreview} childrenDownloadButton={undefined}>
          <ClientReportPreview />
        </ReportPreview>
      )}
    </UserHome>
  );
}
