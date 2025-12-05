"use client";

import { useState, useRef, useEffect } from "react";
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
  const [filterMode, setFilterMode] = useState<"quarter" | "dateRange">("quarter");

  const router = useRouter();
  const [reportData, setReportData] = useState<any[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (filterMode === "quarter") {
      setStartDate("");
      setEndDate("");
    } else {
      setQuarter(null);
    }
  }, [filterMode]);

  const handleQuarterChange = (selection: QuarterSelection) => {
    setQuarter(selection);
    if (selection) {
      setStartDate("");
      setEndDate("");
    }
    setValidationError("");
  };

  const handleSetStartDate = (s: string) => {
    setStartDate(s);
    if (s) setQuarter(null);
    setValidationError("");
  };

  const handleSetEndDate = (e: string) => {
    setEndDate(e);
    if (e) setQuarter(null);
    setValidationError("");
  };

  const handleFind = () => {
    const selectedDate = startDate && endDate;
    const selectedQuarter = quarter !== null;
    const selectedFilter = community || agency || ageGroup;

    if (!selectedDate && !selectedFilter && !selectedQuarter) {
      setValidationError("Please select at least one filter to find.");
      return;
    }

    // Function to get end of day
    const endOfDay = (dateStr: string) => {
      return `${dateStr}T23:59:59.999Z`;
    };

    const filterParams = new URLSearchParams();
    if (community) filterParams.set("community", community);
    if (agency) filterParams.set("agency", agency);
    if (ageGroup) filterParams.set("ageGroup", ageGroup);

    if (quarter) {
      const { startDate: qStart, endDate: qEnd } = getQuarterDateRange(
        quarter.year,
        quarter.quarter
      );
      filterParams.set("startDate", qStart);
      // It will send endDate as end of day to include the entire qEnd day
      filterParams.set("endDate", endOfDay(qEnd));
      filterParams.set("quarter", `${quarter.quarter}-${quarter.year}`);
    } else if (startDate && endDate) {
      filterParams.set("startDate", startDate);
      // It will send endDate as end of day to include the entire endDate day
      filterParams.set("endDate", endOfDay(endDate));
    }

    router.push(`/report/first-nation/filtered?${filterParams.toString()}`);

    setValidationError("");
  };

  const handleOpenPreview = () => setShowPreview(true);

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

          <div className="space-y-6 bg-white shadow-md rounded-2xl p-6">
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

            <div className="max-w-4xl mx-auto">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Filter by:
                </h3>
                </div>

            <div className="max-w-4xl mx-auto flex items-left gap-8 mt-2 justify-start">

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
                <label
                  className="form-check-label px-2 font-medium text-center"
                  htmlFor="quarterCheck"
                >
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
                <label
                  className="form-check-label px-2 font-medium text-center"
                  htmlFor="dateRangeCheck"
                >
                  Date Range
                </label>
              </div>

            </div>

            {filterMode === "quarter" && (
              <div className="max-w-4xl mx-auto">
              <QuarterFilter value={quarter} onChange={handleQuarterChange} />
              </div>
            )}

            {filterMode === "dateRange" && (
              <div className="max-w-4xl mx-auto">
                <DateFilterPage
                  setStartDate={handleSetStartDate}
                  setEndDate={handleSetEndDate}
                />
              </div>
            )}

            {validationError && (
              <div className="text-red-500 text-center">{validationError}</div>
            )}

            <div className="flex flex-col gap-3 mt-6 w-full max-w-sm mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Find
                </h2>

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
        </section>
      </main>

      {showPreview && (
        <ReportPreview onClose={handleClosePreview} childrenDownloadButton={undefined}>
          <ClientReportPreview />
        </ReportPreview>
      )}
    </UserHome>
  );
}