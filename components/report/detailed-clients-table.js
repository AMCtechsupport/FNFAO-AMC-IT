"use client";

import useAdvocateData from "../report/use-advocate-data";

export default function DetailedClientsTable({ advocateId, activeCheck, inactiveCheck }) {
  const { advocateName, clients, loading, error } = useAdvocateData(advocateId);

  // Get rid of this after we fix inputs regarding clientStatus from Clients table
    const setClientStatus = (status) => {
        if (status === "Active") {
            return "Active"
        } else {
            return "Inactive"
        }
    }

  if (loading)
    return (
      <p className="text-center text-gray-500">
        Loading client details...
      </p>
    );

  if (error)
    return (
      <p className="text-center text-red-500">
        {error}
      </p>
    );

  if (clients.length === 0)
    return (
      <p className="text-center text-gray-500">
        No clients found for {advocateName}.
      </p>
    );

  return (
    <div className="overflow-x-auto">
      <div className="border border-gray-200 rounded-xl overflow-y-auto overflow-x-hidden mt-4">
        <h2 className="text-lg font-semibold text-center text-gray-800 py-3 bg-gray-50 rounded-t-xl">
          Clients Assigned to {advocateName}
        </h2>
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Client&apos;s Name
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Status
              </th>
              <th className="text-center px-6 py-3 text-gray-700 font-semibold border-b">
                Number of Children
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.filter((client) => {
                // determine which clients to show based on checkboxes
                const isActive = client.clientStatus === "Active";
                if (activeCheck && inactiveCheck) return true;
                if (activeCheck) return isActive;
                if (inactiveCheck) return !isActive;
                // if neither checkbox is checked show none
                return false;
            }).map((client, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-3 border-b text-center">
                  {client.firstName} {client.lastName}
                </td>
                <td className="px-6 py-3 border-b text-center">
                  {setClientStatus(client.clientStatus)}
                </td>
                <td className="px-6 py-3 border-b text-center">
                  {client.childCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
