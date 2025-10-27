"use client";

import { useParams } from "next/navigation";
import React from "react";
import ClientsReport from "../../../../../components/report/clients-report"; 
import { useState } from "react";
import ReportPreview from "../../../../../components/report/report-preview";
import UserHome from "@/app/user-home/page";

export default function ClientReportPage() {
    const params = useParams();
    const clientId = params?.clientId;
    const [showPreview, setShowPreview] = useState(false);

    const handleOpenPreview = () => setShowPreview(true);
    const handleClosePreview = () => setShowPreview(false);

    console.log("ClientReportPage loaded with clientId:", clientId);

    if (!clientId) {
        return <p style={{ textAlign: "center", marginTop: 40 }}>Client ID not found in URL.</p>;
    }

    return (
        <UserHome>
            <div style={{ padding: 20, background: "#f8fafc", minHeight: "100vh" }}>
                <ClientsReport clientId={clientId} />

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-10">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">
                        Download All
                    </h2>

                    <button
                        type="button"
                        onClick={handleOpenPreview}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                    >
                        Download All
                    </button>
                </div>

                {showPreview && (
                    <ReportPreview onClose={handleClosePreview}>
                        <h2>Download All - Clients</h2>
                        <ClientsReport clientId={clientId} />
                    </ReportPreview>
                )}
            </div>
        </UserHome>
    );
}
