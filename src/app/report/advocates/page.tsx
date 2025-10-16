"use client";

import UserHome from "../../user-home/page";
import AdvocatesTable from "../../../../components/report/advocates-table";
import AdvocatesTableFull from "../../../../components/report/advocates-table-full";
import DateFilterPage from "../../../../components/report/date-range-filter";
import ReportPreview from "../../../../components/report/report-preview";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdvocatesReportPage() {
    const [showPreview, setShowPreview] = useState(false);
    const [selectedAdvocate, setSelectedAdvocate] = useState<{ advocate_id: number; name: string; clientCount: number } | null>(null);
    const [validationError, setValidationError] = useState("");
    const router = useRouter();

    // It handles the Find button click validation
    const handleFind = () => {
        if (!selectedAdvocate) {
            setValidationError("Please select an advocate to find data.");
            return;
        }
        setValidationError("");
        const path = `/report/advocates/${selectedAdvocate.advocate_id}`;
        router.push(path);
    };

    const handleOpenPreview = () => setShowPreview(true);
    const handleClosePreview = () => setShowPreview(false);

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
                        <DateFilterPage />
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
                <ReportPreview onClose={handleClosePreview}>
                    <h2>Download All - Advocates</h2>
                    <AdvocatesTableFull />
                </ReportPreview>
            )}
        </UserHome>
    );
}
