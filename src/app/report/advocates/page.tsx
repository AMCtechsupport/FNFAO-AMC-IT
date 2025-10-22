"use client";

import UserHome from "../../user-home/page";
import AdvocatesTable from "../../../../components/report/advocates-table";
import AdvocatesTableFull, { downloadCSV, downloadJSON } from "../../../../components/report/advocates-table-full";
import DateFilterPage from "../../../../components/report/date-range-filter";
import ReportPreviewAdvocates from "../../../../components/report/report-preview-advocates";
import DownloadDropdown from "../../../../components/report/download-dropdown";
import { useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function AdvocatesReportPage() {
    const [showPreview, setShowPreview] = useState(false);
    const [selectedAdvocate, setSelectedAdvocate] = useState<{ advocate_id: number; name: string; clientCount: number } | null>(null);
    const [validationError, setValidationError] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [downloadFormat, setDownloadFormat] = useState("pdf");
    const [reportData, setReportData] = useState([]); 
    const router = useRouter();

    const contentRef = React.useRef(null);

    // It handles the Find button click validation
    const handleFind = () => {
        const selectedDate = startDate && endDate;
        const selectedPresentAdvocate = !!selectedAdvocate;

        if (!selectedDate && !selectedPresentAdvocate) {
            setValidationError("Please select an advocate or filter.");
            return;
        }
        setValidationError("");

        if (selectedAdvocate) {
            router.push(`/report/advocates/${selectedAdvocate.advocate_id}`);

        } else {
            
            setShowPreview(true); 
        }
    };

    const handleClosePreview = () => {
        setShowPreview(false);
        setReportData([]);
    };

    // Handler to set download format and open preview
    const handleDownloadAll = (format: string) => {
        setDownloadFormat(format);
        setShowPreview(true);
    };

    // New handler to specifically generate and download PDF using html2pdf.js
        const generateAndDownloadPDF = async () => {
        const html2pdf = (await import("html2pdf.js")).default;

        // Ensure the contentRef is assigned else return nothing
        if (!contentRef.current) return;

        // Get the DOM element and set PDF options
        const element = contentRef.current;
        const options = {
            margin: 0.5,
            filename: "test.pdf",
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in" as const, format: "letter" as const, orientation: "landscape" as const },
        };

        // Generate and save the PDF
        await html2pdf().set(options).from(element).save();
        handleClosePreview();
    };


    const handleFinalDownload = () => {
        if (reportData.length === 0) return;

        if (downloadFormat === 'csv') {
            downloadCSV(reportData);
        } else if (downloadFormat === 'json') {
            downloadJSON(reportData);
        }
        
        
        handleClosePreview();
    };

    // This component renders the final dynamic download button
    const DynamicDownloadButton = () => {
        if (downloadFormat === 'pdf') {
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
        
        // Dynamic button for CSV and JSON
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

                <div className="flex flex-col bg-white shadow-md w-full max-w-3xl mx-auto rounded-2xl p-6">

                    {/*pass selected advocate */}
                    <AdvocatesTable onSelect={setSelectedAdvocate} />


                    <div className="flex flex-col gap-2 mt-6 w-full max-w-lg mx-auto">
                        <DateFilterPage setStartDate={setStartDate} setEndDate={setEndDate}/>
                    </div>

                    {/* showing the error message */}
                        {validationError && (
                            <div className="text-red-500 text-center">{validationError}</div>
                            )}

                    <div className="flex flex-col gap-4 mt-6 w-full max-w-sm mx-auto">
                        {/*updated to navigate to selected advocate */}
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Find</h2>

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
            </div>

            {showPreview && (
                <ReportPreviewAdvocates
                    onClose={handleClosePreview} 
                    downloadFormat={downloadFormat}
                    childrenDownloadButton={<DynamicDownloadButton />}
                >
                    <div ref={contentRef}> 
                        <h2 className="text-xl font-semibold mb-2">
                            Advocates Report Preview
                        </h2>
                        
                        <AdvocatesTableFull 
                            onDataLoaded={setReportData}
                        /> 
                    </div>
                </ReportPreviewAdvocates>
            )}
        </UserHome>
    );
}
