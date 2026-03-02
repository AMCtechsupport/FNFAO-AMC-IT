"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { deleteClient } from "../src/app/lib/delete-client-server";

export default function ClientsList({ initialClients, totalCount }) {
  const [clients, setClients] = useState(initialClients);
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [activeClientId, setactiveClientId] = useState(null);

  // New state for total counts from database
  const [totalYouthClients, setTotalYouthClients] = useState(0);
  const [totalAdultClients, setTotalAdultClients] = useState(0);

  const [currentYouthPage, setCurrentYouthPage] = useState(1);
  const [currentAdultPage, setCurrentAdultPage] = useState(1);
  const [totalYouthPages, setTotalYouthPages] = useState(1);
  const [totalAdultPages, setTotalAdultPages] = useState(1);
  const [youthClients, setYouthClients] = useState([]);
  const [adultClients, setAdultClients] = useState([]);
  const clientsPerPage = 10;
  const { userId } = useAuth();

  const router = useRouter();
  const searchTimeoutRef = useRef(null);

  // Determine if client is Youth or Adult based on clientType
  const getClientTypeLabel = (client) => {
    if (client.clientType === "Youth Intake") {
      return "Youth";
    } else if (client.clientType === "Pre-Intake") {
      return "Adult";
    } else {
      // Fallback: determine by age if clientType is not set
      const today = new Date();
      const birthDate = new Date(client.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age <= 20 ? "Youth" : "Adult";
    }
  };

  // Fetch total counts from database
  const fetchTotalCounts = async (searchQuery = "", dateOfBirthQuery = "") => {
    try {
      // Get youth count
      const yParams = new URLSearchParams({
        clientType: "Youth Intake",
        count: "true",
      });
      if (searchQuery) yParams.set("search", searchQuery);
      if (dateOfBirthQuery) yParams.set("dateOfBirth", dateOfBirthQuery);

      const yRes = await fetch(`/api/clients?${yParams.toString()}`);
      if (yRes.ok) {
        const yJson = await yRes.json();
        setTotalYouthClients(yJson.count || 0);
      }

      // Get adult count
      const aParams = new URLSearchParams({
        clientType: "Pre-Intake",
        count: "true",
      });
      if (searchQuery) aParams.set("search", searchQuery);
      if (dateOfBirthQuery) aParams.set("dateOfBirth", dateOfBirthQuery);

      const aRes = await fetch(`/api/clients?${aParams.toString()}`);
      if (aRes.ok) {
        const aJson = await aRes.json();
        setTotalAdultClients(aJson.count || 0);
      }
    } catch (err) {
      console.error("Unexpected error fetching total counts:", err);
    }
  };

  // Handle view button click
  const handleView = (client) => {
    setactiveClientId(client.client_id);
    const clientType = getClientTypeLabel(client);

    setTimeout(() => {
      if (clientType === "Youth") {
        // Redirect Youth clients to youth-clients form for viewing
        router.push(`/youth-clients/${client.client_id}/view`);
      } else {
        // Redirect Adult clients to full-intake form for viewing
        router.push(`/clients/${client.client_id}/view`);
      }
    }, 50);
  };

  // Handle delete button click
  const handleDelete = async (client) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${client.firstName} ${client.lastName}? This action cannot be undone.`,
    );

    if (!confirmDelete) return;

    setDeletingClientId(client.client_id);

    try {
      const result = await deleteClient(client.client_id);

      // Remove client from local state
      setClients((prevClients) =>
        prevClients.filter((c) => c.client_id !== client.client_id),
      );
      // Remove client from client lists immediately
      setYouthClients((prev) =>
        prev.filter((c) => c.client_id !== client.client_id),
      );
      setAdultClients((prev) =>
        prev.filter((c) => c.client_id !== client.client_id),
      );

      // Refresh total counts after deletion
      fetchTotalCounts();

      alert(result.message);
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(`Failed to delete client: ${error.message}`);
    } finally {
      setDeletingClientId(null);
    }
  };

  // Fetch youth clients for the current page and filters
  const fetchYouthClients = async (
    page = 1,
    searchQuery = "",
    dateOfBirthQuery = "",
  ) => {
    try {
      const params = new URLSearchParams({
        clientType: "Youth Intake",
        page: String(page),
        pageSize: String(clientsPerPage),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (dateOfBirthQuery) params.set("dateOfBirth", dateOfBirthQuery);

      const res = await fetch(`/api/clients?${params.toString()}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        console.error("Error fetching youth clients:", j.error || res.status);
        return;
      }

      const j = await res.json();
      setYouthClients(j.data || []);
      setTotalYouthClients(j.count || 0);
      setTotalYouthPages(Math.ceil((j.count || 0) / clientsPerPage));
    } catch (err) {
      console.error("Unexpected error fetching youth clients:", err);
    }
  };

  // Fetch adult clients for the current page and filters
  const fetchAdultClients = async (
    page = 1,
    searchQuery = "",
    dateOfBirthQuery = "",
  ) => {
    try {
      const params = new URLSearchParams({
        clientType: "Pre-Intake",
        page: String(page),
        pageSize: String(clientsPerPage),
      });
      if (searchQuery) params.set("search", searchQuery);
      if (dateOfBirthQuery) params.set("dateOfBirth", dateOfBirthQuery);

      const res = await fetch(`/api/clients?${params.toString()}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        console.error("Error fetching adult clients:", j.error || res.status);
        return;
      }

      const j = await res.json();
      setAdultClients(j.data || []);
      setTotalAdultClients(j.count || 0);
      setTotalAdultPages(Math.ceil((j.count || 0) / clientsPerPage));
    } catch (err) {
      console.error("Unexpected error fetching adult clients:", err);
    }
  };

  useEffect(() => {
    // Only fetch youth clients when youth page or filters change
    fetchYouthClients(currentYouthPage, search, dateOfBirth);
  }, [currentYouthPage, search, dateOfBirth]);

  useEffect(() => {
    // Only fetch adult clients when adult page or filters change
    fetchAdultClients(currentAdultPage, search, dateOfBirth);
  }, [currentAdultPage, search, dateOfBirth]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setInputValue(value); // Update input display immediately

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search (API call)
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      setCurrentYouthPage(1);
      setCurrentAdultPage(1);
    }, 400);
  };

  const handleDateOfBirthChange = (event) => {
    setDateOfBirth(event.target.value);
    setCurrentYouthPage(1);
    setCurrentAdultPage(1);
  };

  const handleYouthPageChange = (page) => {
    if (page >= 1 && page <= totalYouthPages) {
      setCurrentYouthPage(page);
    }
  };

  const handleAdultPageChange = (page) => {
    if (page >= 1 && page <= totalAdultPages) {
      setCurrentAdultPage(page);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1280px",
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: "30px",
          fontWeight: "bold",
          marginBottom: "32px",
          color: "#1f2937",
        }}
      >
        List of Clients
      </h1>

      {/* Search and Filter Section */}
      <div
        style={{
          marginBottom: "32px",
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "600",
            marginBottom: "16px",
            color: "#374151",
          }}
        >
          Search & Filter Options
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by name or client ID..."
            value={inputValue}
            onChange={handleSearchChange}
            style={{
              padding: "8px 16px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              minWidth: "200px",
              outline: "none",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label
              htmlFor="dateOfBirthSearch"
              style={{
                fontSize: "15px",
                color: "#374151",
                fontWeight: "600",
              }}
            >
              Search by Date of Birth:
            </label>
            <input
              type="date"
              placeholder="Search by Date of Birth"
              value={dateOfBirth}
              onChange={handleDateOfBirthChange}
              style={{
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
          gap: "32px",
        }}
      >
        {/* Youth Clients Column */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
              color: "#1d4ed8",
              textAlign: "center",
            }}
          >
            Total Youth Clients ({totalYouthClients})
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {youthClients.map((client) => (
              <div
                key={client.client_id}
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#f3f4f6";
                  const buttons = el.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = "1";
                    buttons.style.visibility = "visible";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#f9fafb";
                  const buttons = el.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = "0";
                    buttons.style.visibility = "hidden";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: "1" }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: "8px",
                        fontSize: "16px",
                      }}
                    >
                      {client.firstName} {client.lastName}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>First Nation:</span>{" "}
                      {client.firstNationMembership || "N/A"}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>DOB:</span>{" "}
                      {new Date(client.dateOfBirth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                  </div>
                  <div
                    data-buttons="true"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginLeft: "16px",
                      opacity: "0",
                      visibility: "hidden",
                      transition:
                        "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
                    }}
                  >
                    <button
                      onClick={() => handleView(client)}
                      disabled={
                        activeClientId !== null || deletingClientId !== null
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: activeClientId ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        opacity:
                          activeClientId && activeClientId !== client.client_id
                            ? 0.6
                            : 1,
                      }}
                    >
                      {activeClientId === client.client_id
                        ? "Opening..."
                        : "View"}
                    </button>

                    <button
                      onClick={() => handleDelete(client)}
                      disabled={
                        deletingClientId === client.client_id ||
                        activeClientId !== null
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor:
                          deletingClientId === client.client_id
                            ? "#9ca3af"
                            : activeClientId !== null
                              ? "#9ca3af"
                              : "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500",
                        opacity:
                          deletingClientId === client.client_id ||
                          activeClientId
                            ? 0.6
                            : 1,
                      }}
                    >
                      {deletingClientId === client.client_id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {youthClients.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontStyle: "italic",
                  padding: "32px",
                }}
              >
                No youth clients found
              </div>
            )}

            {/* Youth Pagination */}
            {youthClients.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => handleYouthPageChange(currentYouthPage - 1)}
                  disabled={currentYouthPage === 1}
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      currentYouthPage === 1 ? "#f3f4f6" : "#1d4ed8",
                    color: currentYouthPage === 1 ? "#9ca3af" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentYouthPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Previous
                </button>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "0 8px",
                  }}
                >
                  Page {currentYouthPage} of {totalYouthPages}
                </span>
                <button
                  onClick={() => handleYouthPageChange(currentYouthPage + 1)}
                  disabled={currentYouthPage === totalYouthPages}
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      currentYouthPage === totalYouthPages
                        ? "#f3f4f6"
                        : "#1d4ed8",
                    color:
                      currentYouthPage === totalYouthPages
                        ? "#9ca3af"
                        : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      currentYouthPage === totalYouthPages
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Adult Clients Column */}
        <div
          style={{
            backgroundColor: "white",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "24px",
              color: "#059669",
              textAlign: "center",
            }}
          >
            Total Adult Clients ({totalAdultClients})
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {adultClients.map((client) => (
              <div
                key={client.client_id}
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#f3f4f6";
                  const buttons = el.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = "1";
                    buttons.style.visibility = "visible";
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.backgroundColor = "#f9fafb";
                  const buttons = el.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = "0";
                    buttons.style.visibility = "hidden";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: "1" }}>
                    <div
                      style={{
                        fontWeight: "600",
                        color: "#111827",
                        marginBottom: "8px",
                        fontSize: "16px",
                      }}
                    >
                      {client.firstName} {client.lastName}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>First Nation:</span>{" "}
                      {client.firstNationMembership || "N/A"}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>DOB:</span>{" "}
                      {new Date(client.dateOfBirth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                  </div>
                  <div
                    data-buttons="true"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      marginLeft: "16px",
                      opacity: "0",
                      visibility: "hidden",
                      transition:
                        "opacity 0.2s ease-in-out, visibility 0.2s ease-in-out",
                    }}
                  >
                    <button
                      onClick={() => handleView(client)}
                      disabled={
                        activeClientId !== null || deletingClientId !== null
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#15803d",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: activeClientId ? "not-allowed" : "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        opacity:
                          activeClientId && activeClientId !== client.client_id
                            ? 0.6
                            : 1,
                      }}
                    >
                      {activeClientId === client.client_id
                        ? "Opening..."
                        : "View"}
                    </button>

                    <button
                      onClick={() => handleDelete(client)}
                      disabled={
                        deletingClientId === client.client_id ||
                        activeClientId !== null
                      }
                      style={{
                        padding: "6px 12px",
                        backgroundColor:
                          deletingClientId === client.client_id
                            ? "#9ca3af"
                            : activeClientId !== null
                              ? "#9ca3af"
                              : "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "500",
                        opacity:
                          deletingClientId === client.client_id ||
                          activeClientId
                            ? 0.6
                            : 1,
                      }}
                    >
                      {deletingClientId === client.client_id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {adultClients.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontStyle: "italic",
                  padding: "32px",
                }}
              >
                No adult clients found
              </div>
            )}

            {/* Adult Pagination */}
            {adultClients.length > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <button
                  onClick={() => handleAdultPageChange(currentAdultPage - 1)}
                  disabled={currentAdultPage === 1}
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      currentAdultPage === 1 ? "#f3f4f6" : "#059669",
                    color: currentAdultPage === 1 ? "#9ca3af" : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: currentAdultPage === 1 ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Previous
                </button>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    padding: "0 8px",
                  }}
                >
                  Page {currentAdultPage} of {totalAdultPages}
                </span>
                <button
                  onClick={() => handleAdultPageChange(currentAdultPage + 1)}
                  disabled={currentAdultPage === totalAdultPages}
                  style={{
                    padding: "6px 12px",
                    backgroundColor:
                      currentAdultPage === totalAdultPages
                        ? "#f3f4f6"
                        : "#059669",
                    color:
                      currentAdultPage === totalAdultPages
                        ? "#9ca3af"
                        : "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      currentAdultPage === totalAdultPages
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
