/*
This component shows the Reports page
after clicking Reports button on the User Home page.
*/

"use client";

import UserHome from "../user-home/page"
import ReportCategory from "../../../components/report/report-category"

export default function ReportPage() {
    return (
        <UserHome>
            <main className="min-h-screen bg-gray-100 p-6">

                {/* Page Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
                        <p className="text-sm text-gray-500 mt-1">Select a category to generate a detailed report</p>
                    </div>
                </div>

                {/* These are the options on the report page */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ReportCategory
                        name="Clients"
                        description="Generate report on the Clients"
                        path="../report/first-nation"
                    />

                    <ReportCategory
                        name="Advocates"
                        description="Generate report about the Advocates"
                        path="../report/advocates"
                    />
                </div>

            </main>
        </UserHome>
    );
}