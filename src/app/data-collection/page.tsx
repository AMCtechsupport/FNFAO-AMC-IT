'use client'

import UserHome from "../user-home/page"
import DataDisplay from "../../../components/data-collection/data-display"


export default function ReportPage() {

    return (
        <UserHome>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* This is the main heading */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Data</h1>

                    <DataDisplay
                        tableName="Clients"
                        selectColumn={["firstName", "lastName", "cfsAgency"]}
                        selectQuery={[
                            {column:"cfsAgency", filter:"CFS Agency X"},
                            {column:"lastName", filter:"Smith"}

                        ]}
                    />
                </div>
            </div>
        </UserHome>
    );
}