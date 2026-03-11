/*
This component shows the content of first nations clients report
after clicking First Nations Report button on the Reports page.
*/
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
import supabase from "../../lib/supabase";

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

  const handleClosePreview = () => {
    setShowPreview(false);
    setReportData([]);
  };

  const handleDownloadAll = async (format: "pdf" | "csv" | "json") => {
    setDownloadFormat(format);

    // Fetching data for CSV and JSON downloads
    if (format === "csv" || format === "json") {
      const { data } = await supabase.from("Clients").select("*");
      setReportData(data || []);
    }

    setShowPreview(true);
  };

  const generateAndDownloadPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;

    if (!contentRef.current) return;

    const element = contentRef.current;
    const options = {
      margin: 0,
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
          className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mt-4"
          style={{ backgroundColor: "#6100D7" }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3a2649"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6100D7"}
        >
          Download PDF
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={handleFinalDownload}
        className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors mt-4"
        style={{ backgroundColor: "#6100D7" }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3a2649"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6100D7"}
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
            <h1 className="text-2xl font-bold text-gray-900">Client&apos;s Report</h1>
            <p className="text-sm text-gray-500 mt-1">Filter by community, agency, age group, or date to generate a report</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">

          {/* Header */}
          <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider rounded-t-xl" style={{ backgroundColor: "#6100D7" }}>
            Report Filters
          </div>

          <div className="p-6 space-y-5">

            <div className="flex flex-col md:flex-row gap-4">
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

            {/* Filter Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by:</h3>

              <div className="flex items-center gap-8">
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
                  <label className="form-check-label px-2 text-sm font-medium text-gray-700" htmlFor="quarterCheck">
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
                  <label className="form-check-label px-2 text-sm font-medium text-gray-700" htmlFor="dateRangeCheck">
                    Date Range
                  </label>
                </div>
              </div>
            </div>

            {filterMode === "quarter" && (
              <QuarterFilter value={quarter} onChange={handleQuarterChange} />
            )}

            {filterMode === "dateRange" && (
              <DateFilterPage
                setStartDate={handleSetStartDate}
                setEndDate={handleSetEndDate}
              />
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
                style={{ backgroundColor: "#6100D7" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3a2649"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6100D7"}
              >
                Find
              </button>

              <DownloadDropdown
                title="Download All"
                onDownloadSelect={handleDownloadAll}
                defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
              />
            </div>

          </div>
        </div>

      </main>

      {showPreview && (
        <ReportPreview onClose={handleClosePreview} childrenDownloadButton={<DynamicDownloadButton />}>
          <div ref={contentRef}>
            <ClientReportPreview />
          </div>
        </ReportPreview>
      )}
    </UserHome>
  );
}
