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

type Client = {
    client_id: string;
    firstName: string;
    lastName: string;
    clientStatus: string;
    childCount: number;
};

export default function AdvocateDetailsPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const router = useRouter();

    const [reportData, setReportData] = useState<Client[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState<"pdf" | "csv" | "json">(
        "pdf"
    );
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

        const element = contentRef.current;
        const options = {
            margin: 0.5,
            filename: `${advocateName || "report"}.pdf`,
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

    // Dynamic download button
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

    const handleRowClick = (clientId: string): void => {
        router.push(`/report/clients-report/${clientId}`);
    };

    const setClientStatus = (status: string): string => {
        return status === "Active" ? "Active" : "Inactive";
    };

    if (loading) {
        return (
            <p className="text-center text-gray-600 mt-10 text-lg font-medium">
                Loading...
            </p>
        );
    }

    if (error) {
        return (
            <p className="text-center text-red-600 mt-10 text-lg font-semibold">
                {error}
            </p>
        );
    }

    return (
        <UserHome>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                    {advocateName} Clients Report
                </h1>

                {clients.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">No clients assigned.</p>
                ) : (
                    <div className="bg-white shadow-md w-full max-w-3xl mx-auto rounded-2xl p-6">
                        {/* Filter checkboxes */}
                        <div className="form-check form-check-inline">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                onChange={(e) => setActiveCheck(e.target.checked)}
                                checked={activeCheck}
                                id="activeCheck"
                            />
                            <label
                                className="form-check-label px-2 font-medium text-center"
                                htmlFor="activeCheck"
                            >
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
                            <label
                                className="form-check-label px-2 font-medium text-center"
                                htmlFor="inactiveCheck"
                            >
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
                                        <th className="px-6 py-3 font-medium">Client&apos;s Name</th>
                                        <th className="px-6 py-3 font-medium text-center">Status</th>
                                        <th className="px-6 py-3 font-medium text-center">
                                            Number of Children
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(clients as Client[])
                                        .filter((client) => {
                                            const isActive = client.clientStatus === "Active";
                                            if (activeCheck && inactiveCheck) return true;
                                            if (activeCheck) return isActive;
                                            if (inactiveCheck) return !isActive;
                                            return false;
                                        })
                                        .map((client) => (
                                            <tr
                                                key={client.client_id}
                                                onClick={() => handleRowClick(client.client_id)}
                                                className="cursor-pointer hover:bg-indigo-50 transition"
                                            >
                                                <td className="px-6 py-3 border-t font-medium text-gray-800">
                                                    {client.firstName} {client.lastName}
                                                </td>
                                                <td className="px-6 py-3 border-t text-center">
                                                    {setClientStatus(client.clientStatus)}
                                                </td>
                                                <td className="px-6 py-3 border-t text-center">
                                                    {client.childCount}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {/* dropdown */}
                        <div className="mt-8 w-full max-w-sm mx-auto">
                            <DownloadDropdown
                                title="Download All"
                                onDownloadSelect={handleDownloadAll}
                                defaultText={`Download All as ${downloadFormat.toUpperCase()}`}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* report preview */}
            {showPreview && (
                <ReportPreviewAdvocates
                    onClose={handleClosePreview}
                    downloadFormat={downloadFormat}
                    childrenDownloadButton={<DynamicDownloadButton />}
                >
                    <div ref={contentRef}>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            All client&apos;s preview
                        </h2>

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
