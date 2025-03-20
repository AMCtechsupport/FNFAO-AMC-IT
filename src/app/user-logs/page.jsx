"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabase";

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

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
    console.log("Received payload:", payload);

    // Extract event, new, and old data from payload
    const { eventType, new: newClient, old: oldClient } = payload;

    // Fallback if eventType is undefined
    const event = eventType || "UNHANDLED";

    let description = "";

    // Utility function to create a detailed client log description
    const generateClientDescription = (client) => {
      const prioritizedFields = [
        "client_id",
        "firstName",
        "lastName",
        "phoneNumber",
        "dateOfBirth",
      ];

      // Helper function to handle each key-value pair in the client data
      const description = [
        ...prioritizedFields.map((field) => {
          return client[field] ? `${field}: ${client[field]}` : `${field}: N/A`;
        }),
        ...Object.keys(client)
          .filter((key) => !prioritizedFields.includes(key))
          .map((key) => {
            return `${key}: ${client[key] || "N/A"}`;
          }),
      ];

      // Join all the key-value pairs into one string with new lines
      return description.filter(Boolean).join("\n");
    };

    // Construct the description based on event type
    switch (event) {
      case "INSERT":
        description = `Client inserted:\n${generateClientDescription(
          newClient
        )}\nEvent Type: ${event}`;
        break;
      case "UPDATE":
        description = `Client updated:\n${generateClientDescription(
          newClient
        )}\nEvent Type: ${event}`;
        break;
      case "DELETE":
        description = `Client deleted:\n${generateClientDescription(
          oldClient
        )}\nEvent Type: ${event}`;
        break;
      default:
        description = `Unhandled event:\nEvent type is ${event}. Payload: ${JSON.stringify(
          payload
        )}`;
        console.log("Unhandled event:", payload);
        break;
    }

    // Fetch the client_id from the new or old client, depending on the event
    const client_id = newClient?.client_id || oldClient?.client_id;

    // Log the event in the User Logs table
    await logUserEvent(description, event, client_id);
  };

  // Function to insert a log into the User Logs table
  const logUserEvent = async (description, eventType, client_id) => {
    const { data, error } = await supabase.from("User Logs").insert([
      {
        description,
        logType: eventType,
        clerk_user_id: "admin",
        client_id,
      },
    ]);

    if (error) {
      console.error("Error logging event:", error);
    } else {
      console.log("Event logged in User Logs table:", data);
    }
  };

  // Function to format the description
  const formatDescription = (description) => {
    return description.split("\n").map((line, index) => (
      <div key={index} className="mb-2">
        {line}
      </div>
    ));
  };

  const openModal = (log) => {
    setSelectedLog(log);
  };

  const closeModal = () => {
    setSelectedLog(null);
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
              <th className="py-3 px-6 font-medium text-gray-800">Client ID</th>
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
                <td colSpan="6" className="text-center py-4 px-6">
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
                  <td className="py-4 px-6">{log.client_id}</td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => openModal(log)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Description
                    </button>
                  </td>
                  <td className="py-4 px-6">{log.logType}</td>
                  <td className="py-4 px-6">{log.clerk_user_id}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={closeModal}
        >
          <div
            className="bg-white p-6 rounded-lg w-1/3 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Log Description</h2>
            <div className="space-y-2">
              {formatDescription(selectedLog.description)}
            </div>
            <button
              onClick={closeModal}
              className="mt-4 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLogs;
