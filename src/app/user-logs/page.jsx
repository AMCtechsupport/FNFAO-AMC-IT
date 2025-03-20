"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import LogTable from "../../../components/user-logs-table";
import SearchBar from "../../../components/user-logs-search";
import LogModal from "../../../components/user-logs-modal";
import LogsPagination from "../../../components/user-logs-pagination";

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);

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

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      let query = supabase.from("User Logs").select("*");

      if (searchQuery) {
        query = query.ilike("client_id", `%${searchQuery}%`);
      }

      query = query.order("createdAt", { ascending: false });

      // Paginate the query
      query = query.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );

      const { data, error, count } = await query;
      if (error) {
        console.error("Error fetching user logs", error);
      } else {
        setLogs(data);
        setTotalLogs(count);
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

    return () => {
      clientChannel.unsubscribe();
    };
  }, [searchQuery, currentPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > Math.ceil(totalLogs / itemsPerPage)) return;
    setCurrentPage(page);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">User Logs</h1>

      {/* Search Bar */}
      <SearchBar value={searchQuery} onSearchChange={handleSearchChange} />

      {/* Log Table */}
      <LogTable logs={logs} loading={loading} onLogClick={setSelectedLog} />

      {/* Pagination */}
      <LogsPagination
        currentPage={currentPage}
        totalItems={totalLogs}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {/* Modal */}
      {selectedLog && (
        <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
};

export default UserLogs;
