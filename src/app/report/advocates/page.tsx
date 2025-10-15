"use client";

import UserHome from "../../user-home/page";
import AdvocatesTable from "../../../../components/report/advocates-table";
import DateFilterPage from "../../../../components/report/date-range-filter";
import FirstNationPage from "../../../../components/report/first-nation-page";
import ReportPreview from "../../../../components/report/report-preview";
import { useState } from "react";

export default function AdvocatesReportPage() {
    const [showPreview, setShowPreview] = useState(false);

    // const handleSelectedAdvocates = () =>
    const handleOpenPreview = () => setShowPreview(true);
    const handleClosePreview = () => setShowPreview(false);

    return (
        <UserHome>
            <div className="min-h-screen bg-gray-100 p-6">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                    Advocates Report
                </h1>

                <div className="flex flex-col bg-white shadow-md w-full max-w-3xl mx-auto rounded-2xl p-6">
                    <AdvocatesTable />

                    <div className="flex flex-col gap-2 mt-6 w-full max-w-lg mx-auto">
                        <DateFilterPage />
                    </div>

                    <div className="flex flex-col gap-4 mt-6 w-full max-w-sm mx-auto">
                        <FirstNationPage name="Find" path="#" />
                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
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
                    </div>
                </div>
            </div>

            {showPreview && (
                <ReportPreview onClose={handleClosePreview}  />
            )}
        </UserHome>
    );
}
