"use client";

import UserHome from "@/app/user-home/page";
import useAdvocateData from "../../../../../components/report/use-advocate-data";
import { useParams } from "next/navigation";

type Client = {
    client_id: string;
    firstName: string;
    lastName: string;
    childCount: number;
};

export default function AdvocateDetailsPage() {
    const { id } = useParams();
    const { advocateName, clients, loading, error } = useAdvocateData(id);

    if (loading)
        return 
    (
        
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

    return (
        <UserHome>
            <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                {advocateName} Clients Report
            </h1>

            {clients.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No clients assigned.</p>
                ) : (<div className="flex flex-col bg-white shadow-md w-full max-w-3xl mx-auto rounded-2xl p-6">          
                        <div
                            className="overflow-y-auto overflow-x-hidden border border-gray-200 rounded-xl"
                            style={{ maxHeight: "800px" }}
                        >
                            <table className="w-full border border-gray-200 rounded-xl">
                        <thead className="bg-indigo-500 text-white text-left">
                            <tr>
                                <th className="px-6 py-3 font-medium">Client&apos;s Name</th>
                                <th className="px-6 py-3 font-medium text-center">
                                    Number of Child
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {(clients as Client[]).map((client, index) => (
                                <tr
                                    key={client.client_id}
                                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                        } hover:bg-indigo-50 transition`}
                                >
                                    <td className="px-6 py-3 border-t font-medium text-gray-800">
                                        {client.firstName} {client.lastName}
                                    </td>
                                    <td className="px-6 py-3 border-t text-center">
                                        {client.childCount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                </div>
            )}
        </div>
        </UserHome>
    );
}
