/*
This component shows the content of advocates report
after clicking Advocates button on the Reports page.
*/
"use client";

import UserHome from "../../user-home/page";
import AdvocatesTable from "../../../../components/report/advocates-table";
import AdvocatesTableFull, {
  downloadCSV,
  downloadJSON,
} from "../../../../components/report/advocates-table-full";
import DateFilterPage from "../../../../components/report/date-range-filter";
import ReportPreviewAdvocates from "../../../../components/report/report-preview-advocates";
import DownloadDropdown from "../../../../components/report/download-dropdown";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

import QuarterFilter from "../../../../components/report/quarterly-dropdown";
import { getQuarterDateRange } from "../../utils/quarter-utils";

type QuarterSelection = {
  year: string;
  quarter: string;
} | null;

export default function AdvocatesReportPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [selectedAdvocate, setSelectedAdvocate] = useState<{
    advocate_id: number;
    name: string;
    clientCount: number;
  } | null>(null);

  const [validationError, setValidationError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [activeCheck, setActiveCheck] = useState(true);
  const [inactiveCheck, setInactiveCheck] = useState(false);

  const [downloadFormat, setDownloadFormat] = useState("pdf");
  const [reportData, setReportData] = useState([]);
  const router = useRouter();
  const contentRef = React.useRef(null);

  const [quarter, setQuarter] = useState<QuarterSelection>(null);
  const [filterMode, setFilterMode] =
    useState<"quarter" | "dateRange">("dateRange");

  useEffect(() => {
    if (filterMode === "quarter") {
      setStartDate("");
      setEndDate("");
    } else {
      setQuarter(null);
    }
  }, [filterMode]);

  // compute real date range
  const effectiveDateRange = (() => {
    if (filterMode === "quarter" && quarter) {
      const { startDate: qStart, endDate: qEnd } = getQuarterDateRange(
        quarter.year,
        quarter.quarter
      );
      return { startDate: qStart, endDate: qEnd };
    }

    return { startDate, endDate };
  })();

  //Advocate required before clicking Find
  const handleFind = () => {
    if (!selectedAdvocate) {
      setValidationError("Please select an Advocate");
      return;
    }

    setValidationError("");

    const params = new URLSearchParams();
    params.set("active", String(activeCheck));
    params.set("inactive", String(inactiveCheck));

    // Add date/quarter
    if (filterMode === "quarter" && quarter) {
      params.set("quarterYear", quarter.year);
      params.set("quarterName", quarter.quarter);
    } else if (filterMode === "dateRange") {
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
    }

    router.push(
      `/report/advocates/${selectedAdvocate.advocate_id}?${params.toString()}`
    );
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setReportData([]);
  };

  const handleDownloadAll = (format: string) => {
    setDownloadFormat(format);
    setShowPreview(true);
  };

  const generateAndDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    if (!contentRef.current) return;

    const element = contentRef.current;
    const options = {
      margin: 0,
      filename: "advocates-report.pdf",
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "in" as const,
        format: "letter" as const,
        orientation: "portrait" as const,
      },
    };

    await html2pdf().set(options).from(element).save();
    handleClosePreview();
  };

  const handleFinalDownload = () => {
    if (reportData.length === 0) return;

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
          className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mt-4"
          style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"}
        >
          Download PDF
        </button>
      );
    }

    if (reportData.length === 0) {
      return (
        <button
          type="button"
          disabled
          className="w-full bg-gray-400 text-white text-sm font-medium py-2.5 px-4 rounded-lg mt-4 cursor-not-allowed"
        >
          Loading data...
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleFinalDownload}
        className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mt-4"
        style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"}
      >
        Download {downloadFormat.toUpperCase()}
      </button>
    );
  };

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advocates Report</h1>
            <p className="text-sm text-gray-500 mt-1">Select an advocate and filters to generate a report</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          {/* Header */}
          <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider rounded-t-xl" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
            Report Filters
          </div>

          <div className="p-6 space-y-5">

            {/* Active / Inactive Filters */}
            <div className="flex gap-6">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) => setActiveCheck(e.target.checked)}
                  checked={activeCheck}
                  id="activeCheck"
                />
                <label className="form-check-label px-2 text-sm font-medium text-gray-700" htmlFor="activeCheck">
                  Active clients
                </label>
              </div>

              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  onChange={(e) => setInactiveCheck(e.target.checked)}
                  checked={inactiveCheck}
                  id="inactiveCheck"
                />
                <label className="form-check-label px-2 text-sm font-medium text-gray-700" htmlFor="inactiveCheck">
                  Inactive clients
                </label>
              </div>
            </div>

            <AdvocatesTable
              onSelect={setSelectedAdvocate}
              active={activeCheck}
              inactive={inactiveCheck}
              startDate={effectiveDateRange.startDate}
              endDate={effectiveDateRange.endDate}
            />

            {/* Filter Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by:</h3>

              <div className="flex items-center gap-8">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="filterMode"
                    value="quarter"
                    checked={filterMode === "quarter"}
                    onChange={() => setFilterMode("quarter")}
                  />
                  Quarter
                </label>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="filterMode"
                    value="dateRange"
                    checked={filterMode === "dateRange"}
                    onChange={() => setFilterMode("dateRange")}
                  />
                  Date Range
                </label>
              </div>
            </div>

            {/* Quarter Filter */}
            {filterMode === "quarter" && (
              <QuarterFilter value={quarter} onChange={setQuarter} />
            )}

            {/* Date Range Filter */}
            {filterMode === "dateRange" && (
              <DateFilterPage setStartDate={setStartDate} setEndDate={setEndDate} />
            )}

            {validationError && (
              <div className="text-red-500 text-sm">{validationError}</div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 max-w-sm mx-auto">
              <button
                type="button"
                onClick={handleFind}
                className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors"
                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"}
              >
                Find
              </button>

              <DownloadDropdown
                onDownloadSelect={handleDownloadAll}
              />
            </div>

          </div>
        </div>

      </main>

      {showPreview && (
        <ReportPreviewAdvocates
          onClose={handleClosePreview}
          downloadFormat={downloadFormat}
          childrenDownloadButton={<DynamicDownloadButton />}
        >
          <div ref={contentRef}>
            <h2 className="text-xl font-semibold mb-2">Advocates Report Preview</h2>

            <AdvocatesTableFull
              onDataLoaded={setReportData}
              active={activeCheck}
              inactive={inactiveCheck}
              startDate={effectiveDateRange.startDate}
              endDate={effectiveDateRange.endDate}
            />
          </div>
        </ReportPreviewAdvocates>
      )}
    </UserHome>
  );
}
