"use client";

import UserHome from "../../user-home/page";
import DateFilterPage from "../../../../components/report/date-range-filter";
import FirstNationPage from "../../../../components/report/first-nation-page";
import AdvocatesTable from "../../../../components/report/advocates-table";
import { useState } from "react";
import ReportPreview from "../../../../components/report/report-preview";

export default function AdvocatesReportPage() {

      const [showPreview, setShowPreview] = useState(false);
    
      // Handles opening the report preview modal
      const handleOpenPreview = () => setShowPreview(true);
    
      // Handles closing the report preview modal
      const handleClosePreview = () => setShowPreview(false);

    //array of advocates
    const advocatesList = [
        { name: "Tic Tac", client: 16 },
        { name: "Tin Tra", client: 28 },
        { name: "Zig Zag", client: 23 },
    ];

    return (
        <UserHome>
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Advocates Report
                </h1>

                <div className="flex flex-col bg-white shadow-md w-full max-w-lg mx-auto rounded-2xl p-6">
                    {/* Advocates Table */}
                    <AdvocatesTable array={advocatesList} />

                    {/* Date Range Filter */}
                    <div className="flex flex-col gap-2 mt-6 w-full max-w-lg mx-auto">
                        <DateFilterPage />
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-4 mt-6 w-full max-w-sm mx-auto">
                        <FirstNationPage name="Find" path="#" />
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Download All</h2>

                            <button
                            type="button"
                            onClick={handleOpenPreview}
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                            >
                            Download All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Preview Modal */}
            {showPreview && (
                <ReportPreview onClose={handleClosePreview} onDownload={undefined} />
            )}
        </UserHome>
    );
}

