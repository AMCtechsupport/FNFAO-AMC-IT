"use client";

import UserHome from "@/app/user-home/page";
import useAdvocateData from "../../../../../components/report/use-advocate-data";
import ReportPreview from "../../../../../components/report/report-preview";
import DetailedClientsTable from "../../../../../components/report/detailed-clients-table";
import { useParams, useRouter } from "next/navigation"; 
import { useState } from "react";

type Client = {
    client_id: string;
    firstName: string;
    lastName: string;
    clientStatus: string;
    childCount: number;
};

export default function AdvocateDetailsPage() {
    const { id } = useParams();
    const router = useRouter(); 
    const [showPreview, setShowPreview] = useState(false);
    const { advocateName, clients, loading, error } = useAdvocateData(id);

    const [activeCheck, setActiveCheck] = useState(true)
    const [inactiveCheck, setInactiveCheck] = useState(false)

const handleOpenPreview = () => setShowPreview(true);
    const handleClosePreview = () => setShowPreview(false);

    if (loading)
        return (
            <p className="text-center text-gray-600 mt-10 text-lg font-medium">
                Loading...
            </p>
        );

    if (error)
        return (
            <p className="text-center text-red-600 mt-10 text-lg font-semibold">
                {error}
            </p>
        );

    // Get rid of this after we fix inputs regarding clientStatus from Clients table
    const setClientStatus = (status: string) => {
        if (status === "Active") {
            return "Active"
        } else {
            return "Inactive"
        }
    }

    //new function to handle row click
    const handleRowClick = (clientId: string) => {
        router.push(`/clients/${clientId}`);
    };

    return (
        <UserHome>
            <div className="p-6 bg-gray-50 min-h-screen">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                    {advocateName} Clients Report
                </h1>
                {clients.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg">
                        No clients assigned.
                    </p>
                ) : (
                    <div className="bg-white shadow-md w-full max-w-3xl mx-auto rounded-2xl p-6">
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" onChange={e => setActiveCheck(e.target.checked)} checked={activeCheck} id="activeCheck"/>
                            <label className="form-check-label px-2 font-medium text-center" htmlFor="activeCheck">
                            Active users
                            </label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="checkbox" onChange={e => setInactiveCheck(e.target.checked)} checked={inactiveCheck} id="inactiveCheck"/>
                            <label className="form-check-label px-2 font-medium text-center" htmlFor="inactiveCheck">
                            Inactive users
                            </label>
                        </div>
                        <div
                            className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl"
                            style={{ maxHeight: "800px" }}
                        >
                            <table className="w-full border border-gray-200 rounded-xl">
                                <thead className="bg-indigo-500 text-white text-left">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Client&apos;s Name</th>
                                        <th className="px-6 py-3 font-medium text-center">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 font-medium text-center">
                                            Number of Child
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(clients as Client[])
                                        .filter((client) => {
                                            // determine which clients to show based on checkboxes
                                            const isActive = client.clientStatus === "Active";
                                            if (activeCheck && inactiveCheck) return true;
                                            if (activeCheck) return isActive;
                                            if (inactiveCheck) return !isActive;
                                            // if neither checkbox is checked show none
                                            return false;
                                        })
                                        .map((client) => (
                                            <tr
                                                key={client.client_id}
                                                onClick={() => handleRowClick(client.client_id)}
                                                className="cursor-pointer hover:bg-indigo-50 transition"
                                            >
                                                <td className="px-6 py-3 border-t font-medium text-gray-800">
                                                    {client.firstName} {client.lastName}
                                                </td>
                                                <td className="px-6 py-3 border-t text-center">
                                                    {setClientStatus(client.clientStatus)}
                                                </td>
                                                <td className="px-6 py-3 border-t text-center">
                                                    {client.childCount}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-10">
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
                )}
            </div>

            {showPreview && (
                <ReportPreview onClose={handleClosePreview}>
                    <h2>Download All - Clients</h2>
                    <DetailedClientsTable advocateId={id} activeCheck={activeCheck} inactiveCheck={inactiveCheck} />
                </ReportPreview>
            )}
        </UserHome>
    );
}
