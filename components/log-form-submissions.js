import { useEffect, useState } from "react";
import supabase from "@/app/lib/supabase";

const useRealTimeLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial logs data
  useEffect(() => {
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
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Clients" },
        (payload) => {
          console.log("Real-time change detected:", payload);
          handleRealTimeChange(payload); // Handle real-time changes and log them
        }
      )
      .subscribe();

    // Cleanup on component unmount
    return () => {
      supabase.removeSubscription(clientChannel);
    };
  }, []);

  // Handle real-time changes
  const handleRealTimeChange = async (payload) => {
    console.log("Received payload:", payload); // Log the entire payload to debug

    // Destructure the payload
    const { eventType, new: newClient, old: oldClient } = payload;

    // Check if eventType is missing in the payload
    if (!eventType) {
      console.error("Event type is missing in the payload:", payload);
      return;
    }

    let description = "";
    let logData = {}; // Data to be logged

    switch (eventType) {
      case "INSERT":
        // Ensure `newClient` data exists for an insert event
        if (!newClient) {
          console.error("Missing 'new' data for INSERT event:", payload);
          description = "New client inserted, but no data provided.";
          logData = {
            description,
            logType: "INSERT",
            clerk_user_id: "admin", // Default to admin if no user ID
          };
        } else {
          console.log("New client inserted:", newClient);
          description = `New client inserted: ${
            newClient.firstName || "Unknown"
          } ${newClient.lastName || "Unknown"}`;
          logData = {
            description,
            logType: "INSERT",
            client_id: newClient.client_id || "N/A", // Use default if not available
            createdAt: newClient.createdAt || new Date().toISOString(),
            clerk_user_id: newClient.clerk_user_id || "admin", // Default to admin if no user ID
          };
        }
        break;

      case "UPDATE":
        // Ensure `newClient` data exists for an update event
        if (!newClient) {
          console.error("Missing 'new' data for UPDATE event:", payload);
          description = "Client updated, but no data provided.";
          logData = {
            description,
            logType: "UPDATE",
            clerk_user_id: "admin", // Default to admin if no user ID
          };
        } else {
          console.log("Client updated:", newClient);
          description = `Client updated: ${newClient.firstName || "Unknown"} ${
            newClient.lastName || "Unknown"
          }`;
          logData = {
            description,
            logType: "UPDATE",
            client_id: newClient.client_id || "N/A",
            createdAt: newClient.createdAt || new Date().toISOString(),
            clerk_user_id: newClient.clerk_user_id || "admin",
          };
        }
        break;

      case "DELETE":
        // Ensure `oldClient` data exists for a delete event
        if (!oldClient || !oldClient.client_id) {
          console.error("Missing 'old' data for DELETE event:", payload);
          description = "Client deleted, but no data provided.";
          logData = {
            description,
            logType: "DELETE",
            clerk_user_id: "admin", // Default to admin if no user ID
          };
        } else {
          console.log("Client deleted:", oldClient);
          description = `Client deleted with ID: ${oldClient.client_id}`;
          logData = {
            description,
            logType: "DELETE",
            client_id: oldClient.client_id || "N/A",
            createdAt: oldClient.createdAt || new Date().toISOString(),
            clerk_user_id: oldClient.clerk_user_id || "admin",
          };
        }
        break;

      default:
        console.log("Unhandled event type:", eventType);
        return;
    }

    // Log the event in the User Logs table
    try {
      await logUserEvent(logData); // Function to save logs to the database
    } catch (error) {
      console.error("Error logging event:", error);
    }
  };

  // Function to insert a log into the User Logs table
  const logUserEvent = async (logData) => {
    const { description, logType, clerk_user_id, client_id, createdAt } =
      logData;

    const { data, error } = await supabase.from("User Logs").insert([
      {
        log_id: `log-${new Date().getTime()}`,
        description,
        logType,
        clerk_user_id,
        client_id: client_id || "N/A",
        createdAt: createdAt || new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error logging event:", error);
    } else {
      console.log("Event logged in User Logs table:", data);
    }
  };

  return { logs, loading };
};

export default useRealTimeLogs;
