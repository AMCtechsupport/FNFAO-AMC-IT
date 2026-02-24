/*
This component shows the preview of client report
after clicking on a Download button on the clients report page.
*/

"use client";

import { useParams } from "next/navigation";
import React, { useState, useRef } from "react";
import ClientsReport from "../../../../../components/report/clients-report";
import ReportPreview from "../../../../../components/report/report-preview";
import UserHome from "@/app/user-home/page";
import DownloadDropdown from "../../../../../components/report/download-dropdown";
import {
    downloadCSV,
    downloadJSON,
} from "../../../../../components/report/advocates-table-full";

export default function ClientReportPage() {
    const params = useParams();
    const clientId = params?.clientId;
    const [showPreview, setShowPreview] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv" | "json">(
        "pdf"
    );
    const [reportData, setReportData] = useState([]);
    const contentRef = useRef<HTMLDivElement | null>(null);

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
            margin: 0,
            filename: `client-report-${clientId}.pdf`,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: {
                unit: "in" as const,
                format: "letter" as const,
                orientation: "landscape" as const,
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

    if (!clientId) {
        return (
            <p style={{ textAlign: "center", marginTop: 40 }}>
                Client ID not found in URL.
            </p>
        );
    }

    return (
        <UserHome>
            <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh" }}>
                <ClientsReport clientId={clientId} setReportData={setReportData} />

                {/* Download Section */}
                <div className="mt-8">
                    <DownloadDropdown
                        title="Download All"
                        onDownloadSelect={handleDownloadAll}
                        defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
                    />

                {showPreview && (
                    <ReportPreview
                        onClose={handleClosePreview}
                        childrenDownloadButton={<DynamicDownloadButton />}
                    >
                        <div ref={contentRef}>
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                                Client Report Preview
                            </h2>
                            <ClientsReport
                                clientId={clientId}
                                setReportData={setReportData}
                            />
                        </div>
                    </ReportPreview>
                )}
            </div>
            </div>
        </UserHome>
    );
}
