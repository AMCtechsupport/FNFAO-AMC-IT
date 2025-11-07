"use client";

import { useEffect } from "react";
import useAdvocateData from "../report/use-advocate-data";


function calculateAge(dob) {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function DetailedClientsTable({
  advocateId,
  activeCheck,
  inactiveCheck,
  onDataReady, 
}) {
  const { advocateName, clients, loading, error } = useAdvocateData(advocateId);

  useEffect(() => {
    if (!loading && clients && onDataReady) {
      onDataReady(clients);
    }
  }, [clients, loading, onDataReady]);

  const setClientStatus = (status) => {
    return status === "Active" ? "Active" : "Inactive";
  };

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
        <h2 className="text-lg font-semibold text-center text-gray-800 py-3 bg-gray-50 rounded-t-xl">
          Clients Assigned to {advocateName}
        </h2>
        <table className="w-full border border-gray-200 rounded-xl">
          <thead className="bg-indigo-100">
            <tr>
                <th className="px-6 py-3 font-medium text-center">Name</th>
                <th className="px-6 py-3 font-medium text-center">Age</th>
                <th className="px-6 py-3 font-medium text-center">CFS Agency</th>
                <th className="px-6 py-3 font-medium text-center">First Nation Membership</th>
                <th className="px-6 py-3 font-medium text-center">Number of Children</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium text-center">Date of Inactivity</th>
                <th className="px-6 py-3 font-medium text-center">Reason for Inactivity</th>
                <th className="px-6 py-3 font-medium text-center">Date Created</th>
              </tr>
          </thead>
          <tbody>
            {clients
              .filter((client) => {
                const isActive = client.clientStatus === "Active";
                if (activeCheck && inactiveCheck) return true;
                if (activeCheck) return isActive;
                if (inactiveCheck) return !isActive;
                return false;
              })
              .map((client) => (
                <tr key={client.client_id} className="text-center">
                  <td className="px-6 py-3 border-t text-center">{client.firstName} {client.lastName}</td>
                  <td className="px-6 py-3 border-t text-center">{calculateAge(client.dateOfBirth)}</td>
                  <td className="px-6 py-3 border-t text-center">{client.cfsAgency}</td>
                  <td className="px-6 py-3 border-t text-center">{client.firstNationMembership}</td>
                  <td className="px-6 py-3 border-t text-center">{client.childCount}</td>
                  <td className="px-6 py-3 border-t text-center">{setClientStatus(client.clientStatus)}</td>
                  <td className="px-6 py-3 border-t text-center">-</td>
                  <td className="px-6 py-3 border-t text-center">-</td>
                  <td className="px-6 py-3 border-t text-center">{client.createdAt}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
  );
}
