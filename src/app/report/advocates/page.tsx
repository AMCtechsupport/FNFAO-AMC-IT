"use client";

import UserHome from "../../user-home/page";
import DateFilterPage from "../../../../components/report/date-range-filter";
import FirstNationPage from "../../../../components/report/first-nation-page";
import AdvocatesTable from "../../../../components/report/advocates-table";

export default function AdvocatesReportPage() {
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
                        <FirstNationPage name="Download All" path="#" />
                    </div>
                </div>
            </div>
        </UserHome>
    );
}
