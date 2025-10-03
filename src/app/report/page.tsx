
"use client";

import UserHome from "../user-home/page"
import Link from "next/link"

export default function ReportPage() {
    return (
        <UserHome>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* This is the main heading */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">This is a report page</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Nation Report Generation */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">First Nations</h2>
                        <p className="text-gray-600 mb-4">
                            Generate Report on the First Nations communities
                        </p>
                        <Link href="/export">
                            <button
                                type="button"
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
                            >
                                First Nation
                            </button>
                        </Link>
                    </div>
                    

                    {/* First Nation Report Generation */}
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Advocates</h2>
                        <p className="text-gray-600 mb-4">
                            Generate Report on the First Nations communities
                        </p>
                        <button
                            type="button"
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
                        >
                            Advocates
                        </button>
                    </div>
                </div>

                </div>
            </div>
        </UserHome>
    );
}