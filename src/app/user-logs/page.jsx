"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial logs data
    const fetchLogs = async () => {
      const { data, error } = await supabase.from("User Logs").select("*");
      if (error) {
        console.error("Error fetching user logs", error);
      } else {
        setLogs(data);
      }
      setLoading(false);
    };

    fetchLogs();

    // Real-time subscription to changes in the "Clients" table
    const clientChannel = supabase
      .channel("custom-client-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Clients" },
        (payload) => {
          console.log("Change received in Clients table!", payload);
          handleRealTimeChange(payload);
        }
      )
      .subscribe();

    // Cleanup on component unmount
    return () => {
      supabase.removeSubscription(clientChannel);
    };
  }, []);

  // Handle real-time changes in the Clients table
  const handleRealTimeChange = async (payload) => {
    console.log("Received payload:", payload); // Log payload for debugging

    // Extract event, new, and old data from payload
    const { eventType, new: newClient, old: oldClient } = payload;

    // Fallback if eventType is undefined
    const event = eventType || "UNHANDLED"; // Default to "UNHANDLED" if eventType is missing

    // Extract relevant fields from newClient and oldClient
    const client_id = newClient?.client_id || oldClient?.client_id;
    const clientFirstName = newClient?.firstName || oldClient?.firstName;
    const clientLastName = newClient?.lastName || oldClient?.lastName;
    const createdBy = newClient?.createdBy || oldClient?.createdBy;

    let description = "";

    // Check event type and set appropriate description
    switch (event) {
      case "INSERT":
        description = `Client inserted: 
          client_id: ${client_id}
          ${clientFirstName} ${clientLastName}
          Event Type: ${event}
          Created By: ${createdBy}`;
        break;
      case "UPDATE":
        description = `Client updated: 
          client_id: ${client_id}
          ${clientFirstName} ${clientLastName}
          Event Type: ${event}
          Created By: ${createdBy}`;
        break;
      case "DELETE":
        description = `Client deleted: 
          client_id: ${client_id}
          ${clientFirstName} ${clientLastName}
          Event Type: ${event}
          Created By: ${createdBy}`;
        break;
      default:
        description = `Unhandled event: 
Event type is ${event}. Payload: ${JSON.stringify(payload)}`;
        console.log("Unhandled event:", payload);
        break;
    }

    // Log the event in the User Logs table
    await logUserEvent(description, event);
  };

  // Function to insert a log into the User Logs table
  const logUserEvent = async (description, eventType) => {
    const { data, error } = await supabase.from("User Logs").insert([
      {
        description,
        logType: eventType,
        clerk_user_id: "admin",
      },
    ]);

    if (error) {
      console.error("Error logging event:", error);
    } else {
      console.log("Event logged in User Logs table:", data);
    }
  };

  if (loading)
    return <div className="text-center text-xl text-gray-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">User Logs</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-6 font-medium text-gray-800">Log ID</th>
              <th className="py-3 px-6 font-medium text-gray-800">
                Created At
              </th>
              <th className="py-3 px-6 font-medium text-gray-800">
                Description
              </th>
              <th className="py-3 px-6 font-medium text-gray-800">Log Type</th>
              <th className="py-3 px-6 font-medium text-gray-800">
                Clerk User ID
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 px-6">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.log_id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">{log.log_id}</td>
                  <td className="py-4 px-6">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">{log.description}</td>
                  <td className="py-4 px-6">{log.logType}</td>
                  <td className="py-4 px-6">{log.clerk_user_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserLogs;
