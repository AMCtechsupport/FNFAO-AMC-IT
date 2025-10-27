'use client'

import UserHome from "@/app/user-home/page"
import React from "react";
import { useSearchParams } from "next/navigation";
import DataDisplay from "../../../../../components/data-collection/data-display";

export default function ClientFilterPage() {
    const filter = useSearchParams()
    const community = filter.get('community')
    const agency = filter.get('agency')
    const ageGroup = filter.get('ageGroup')

    return (
        <UserHome>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div>
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
                    selectQuery={[
                        { column: "firstNationMembership", filter:  `${community}` },
                        { column: "cfsAgency", filter:  `${agency}` },
                    ]}
                />


                <button
                  type="button"
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  Download All
                </button>
            </div>
        </UserHome>
    )
}