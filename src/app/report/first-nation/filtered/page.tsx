'use client'

import UserHome from "@/app/user-home/page"
import React from "react";
import { useSearchParams } from "next/navigation";
import DataDisplay from "../../../../../components/data-collection/data-display";
import supabase from "@/app/lib/supabase";
import { useEffect, useState } from "react";

export default function ClientFilterPage() {
    const filter = useSearchParams()
    const community = filter.get('community')
    const agency = filter.get('agency')
    const ageGroup = filter.get('ageGroup')
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [items, setItems] = useState<string[] | null>(null);

    

    useEffect(() => {
        const fetchClients = async () => {

            const params = [{column: "firstNationMembership", search: community},{column: "cfsAgency", search: agency}]

            let query = supabase.from("Clients").select("firstName, lastName, cfsAgency, firstNationMembership")

            if (params) {
                params.forEach((filter) => {
                    if (filter.search)
                        query = query.eq(filter.column, filter.search)
                });
            }

            const {data, error} = await query

            if (error) {
            setFetchError("Could not fetch the table");
            setItems(null);
            }
            if (data) {
            setItems(data);
            setFetchError(null);
        }
        }

        fetchClients();
    },[]);

    // Check if items is and array
    if (!Array.isArray(items)) return null;
    if (items === null) return null;


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

                <table>
                    <thead>
                        <tr>
                        {/* Heading */}
                        {Object.keys(items[0]).map((key) => (
                        <th
                        key={key}
                        className="text-center px-6 py-3 text-gray-700 font-semibold border-b"
                        >
                        {key}
                        </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Item Rows */}
                        {items.map((item, idx) => (
                        <tr key={idx}>
                            {Object.values(item).map((value, i) => (
                            <td key={i} className="px-6 py-3 border-b text-center">
                                {value}
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>


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