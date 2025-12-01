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
  const [filterMode, setFilterMode] = useState<"quarter" | "dateRange">("dateRange");

  useEffect(() => {
    if (filterMode === "quarter") {
      setStartDate("");
      setEndDate("");
    } else {
      setQuarter(null);
    }
  }, [filterMode]);

  const effectiveDateRange = (() => {
    if (quarter) {
      const { startDate: qStart, endDate: qEnd } = getQuarterDateRange(
        quarter.year,
        quarter.quarter
      );
      return { startDate: qStart, endDate: qEnd };
    }
    return { startDate, endDate };
  })();

  // UPDATED: allow navigation even if advocate has 0 clients
  const handleFind = () => {
    const selectedDate = startDate && endDate;
    const selectedQuarter = quarter !== null;
    const selectedAdvocateCheck = !!selectedAdvocate;

    if (!selectedDate && !selectedQuarter && !selectedAdvocateCheck) {
      setValidationError("Please select an advocate or filter.");
      return;
    }

    setValidationError("");

    if (selectedAdvocate) {
      router.push(`/report/advocates/${selectedAdvocate.advocate_id}`);
      return;
    }

    // if no advocate selected but date/quarter selected, open preview
    if (selectedDate || selectedQuarter) {
      setShowPreview(true);
      return;
    }

    setValidationError("Please select an advocate or filter.");
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
      margin: 0.5,
      filename: "test.pdf",
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
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors mt-4"
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
          className="w-full bg-gray-400 text-white font-medium py-3 px-4 rounded-md mt-4 cursor-not-allowed"
        >
          Loading data...
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
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Advocates Report
        </h1>

        <div className="bg-white shadow-md w-full max-w-3xl mx-auto rounded-2xl p-6">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              onChange={(e) => setActiveCheck(e.target.checked)}
              checked={activeCheck}
              id="activeCheck"
            />
            <label className="form-check-label px-2 font-medium" htmlFor="activeCheck">
              Active users
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
            <label className="form-check-label px-2 font-medium" htmlFor="inactiveCheck">
              Inactive users
            </label>
          </div>

          <AdvocatesTable
            onSelect={setSelectedAdvocate}
            active={activeCheck}
            inactive={inactiveCheck}
            startDate={effectiveDateRange.startDate}
            endDate={effectiveDateRange.endDate}
          />

          <div className="max-w-3xl mx-auto mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter by:</h3>
          </div>

          <div className="max-w-3xl mx-auto flex items-left gap-8 mt-2 justify-start">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                onChange={(e) =>
                  e.target.checked ? setFilterMode("quarter") : setFilterMode("dateRange")
                }
                checked={filterMode === "quarter"}
                id="quarterCheck"
              />
              <label className="form-check-label px-2 font-medium" htmlFor="quarterCheck">
                Quarter
              </label>
            </div>

            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                onChange={(e) =>
                  e.target.checked ? setFilterMode("dateRange") : setFilterMode("quarter")
                }
                checked={filterMode === "dateRange"}
                id="dateRangeCheck"
              />
              <label className="form-check-label px-2 font-medium" htmlFor="dateRangeCheck">
                Date Range
              </label>
            </div>
          </div>

          {filterMode === "quarter" && (
            <div className="max-w-3xl mx-auto">
              <QuarterFilter value={quarter} onChange={setQuarter} />
            </div>
          )}

          {filterMode === "dateRange" && (
            <div className="flex flex-col gap-2 mt-6 w-full max-w-lg mx-auto">
              <DateFilterPage setStartDate={setStartDate} setEndDate={setEndDate} />
            </div>
          )}

          {validationError && (
            <div className="text-red-500 text-center">{validationError}</div>
          )}

          <div className="flex flex-col gap-4 mt-6 w-full max-w-sm mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Find</h2>

              <button
                type="button"
                onClick={handleFind}
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
      </div>

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
