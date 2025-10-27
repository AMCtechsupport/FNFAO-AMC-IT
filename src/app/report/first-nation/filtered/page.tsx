'use client'

import UserHome from "@/app/user-home/page"
import React from "react";
import { useSearchParams } from "next/navigation";
import DataDisplay from "../../../../../components/data-collection/data-display";
import supabase from "@/app/lib/supabase";

export default function ClientFilterPage() {
    const filter = useSearchParams()
    const community = filter.get('community')
    const agency = filter.get('agency')
    const ageGroup = filter.get('ageGroup')

    const params = [{column: "firstNationMembership", search: community},{column: "cfsAgency", search: agency}]

    const fetchClients = async () => {
        try {

            let query = supabase.from("Clients").select("firstName + lastName as Name, cfsAgency, firstNationMembership")
            params.map((item) => (
                if (item)
                    query = query.eq()
            ))
            const {data: clientData, error: clientError} = await query
        } catch(clientError) {

        }
    }

    return (
        <UserHome>
            <div className="p-6 bg-gray-50 min-h-screen">
                {/* This is the main heading */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Generate Report</h1>
                <div>
                    <h3>Tags:</h3>
                    <p className="badge text-bg-secondary">{community}</p>
                    <p className="badge text-bg-secondary">{agency}</p>
                    <p className="badge text-bg-secondary">{ageGroup}</p>
                </div>

                <DataDisplay 
                    tableName="Clients"
                    selectColumn={[
                        "firstName",
                        "lastName",
                        "cfsAgency",
                        "firstNationMembership"
                    ]}
                />


                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Download All</h2>

                    <button
                    type="button"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                    >
                        Download All
                    </button>
                </div>
            </div>
        </UserHome>
    )
}