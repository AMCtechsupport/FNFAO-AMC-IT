'use client'

// Remove this page and folder before production

import UserHome from "../user-home/page"
import DataDisplay from "../../../components/data-collection/data-display"
import DataColumn from "../../../components/data-collection/data-column"

export default function ReportPage() {

    const word = DataColumn("Clients", "cfsAgency")

    return (
        <UserHome>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* This is the main heading */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Data</h1>

                    <p>{word}
                    </p>

                    <DataDisplay
                        tableName="Clients"
                        selectColumn={["firstName", "lastName", "clientStatus"]}
                        selectQuery={[
                            {column: "clientStatus", filter: "Active"}
                        ]}
                        
                    />
                </div>
            </div>
        </UserHome>
    );
}