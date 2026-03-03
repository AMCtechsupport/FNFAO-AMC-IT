"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { deleteClient } from "../src/app/lib/delete-client-server";

export default function ClientsList({ initialClients, totalCount }) {
  const [allYouthClients, setAllYouthClients] = useState([]);
  const [allAdultClients, setAllAdultClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [activeClientId, setactiveClientId] = useState(null);
  const [currentYouthPage, setCurrentYouthPage] = useState(1);
  const [currentAdultPage, setCurrentAdultPage] = useState(1);
  const clientsPerPage = 10;
  const { userId } = useAuth();
  const router = useRouter();

  // Load all clients once on mount
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [yRes, aRes] = await Promise.all([
          fetch(`/api/clients?clientType=Youth+Intake&page=1&pageSize=9999`),
          fetch(`/api/clients?clientType=Pre-Intake&page=1&pageSize=9999`),
        ]);
        const [yJson, aJson] = await Promise.all([yRes.json(), aRes.json()]);
        setAllYouthClients(yJson.data || []);
        setAllAdultClients(aJson.data || []);
      } catch (err) {
        console.error("Error fetching all clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Client-side filtering by name (contains) or ID (starts-with), plus DOB
  const filterClients = (clients) => {
    return clients.filter((client) => {
      const term = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (term) {
        const idStr = String(client.client_id);
        const fullName = [client.firstName, client.middleName, client.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        matchesSearch = idStr.startsWith(term) || fullName.includes(term);
      }

      const matchesDOB =
        !dateOfBirth ||
        (client.dateOfBirth && client.dateOfBirth.startsWith(dateOfBirth));

      return matchesSearch && matchesDOB;
    });
  };

  const filteredYouth = filterClients(allYouthClients);
  const filteredAdult = filterClients(allAdultClients);

  const totalYouthPages = Math.max(
    1,
    Math.ceil(filteredYouth.length / clientsPerPage),
  );
  const totalAdultPages = Math.max(
    1,
    Math.ceil(filteredAdult.length / clientsPerPage),
  );

  const paginatedYouth = filteredYouth.slice(
    (currentYouthPage - 1) * clientsPerPage,
    currentYouthPage * clientsPerPage,
  );
  const paginatedAdult = filteredAdult.slice(
    (currentAdultPage - 1) * clientsPerPage,
    currentAdultPage * clientsPerPage,
  );

  // Determine if client is Youth or Adult based on clientType
  const getClientTypeLabel = (client) => {
    if (client.clientType === "Youth Intake") {
      return "Youth";
    } else if (client.clientType === "Pre-Intake") {
      return "Adult";
    } else {
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

  // Handle view button click
  const handleView = (client) => {
    setactiveClientId(client.client_id);
    const clientType = getClientTypeLabel(client);

    setTimeout(() => {
      if (clientType === "Youth") {
        router.push(`/youth-clients/${client.client_id}/view`);
      } else {
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

      setAllYouthClients((prev) =>
        prev.filter((c) => c.client_id !== client.client_id),
      );
      setAllAdultClients((prev) =>
        prev.filter((c) => c.client_id !== client.client_id),
      );

      alert(result.message);
    } catch (error) {
      console.error("Error deleting client:", error);
      alert(`Failed to delete client: ${error.message}`);
    } finally {
      setDeletingClientId(null);
    }
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
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentYouthPage(1);
              setCurrentAdultPage(1);
            }}
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
              onChange={(e) => {
                setDateOfBirth(e.target.value);
                setCurrentYouthPage(1);
                setCurrentAdultPage(1);
              }}
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

      {loading && (
        <p style={{ textAlign: "center", color: "#6b7280" }}>
          Loading clients...
        </p>
      )}

      {/* Two Column Layout */}
      {!loading && (
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
              Total Youth Clients ({filteredYouth.length})
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {paginatedYouth.map((client) => (
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
                            activeClientId &&
                            activeClientId !== client.client_id
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
              {paginatedYouth.length === 0 && (
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
              {filteredYouth.length > clientsPerPage && (
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
                      cursor:
                        currentYouthPage === 1 ? "not-allowed" : "pointer",
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
              Total Adult Clients ({filteredAdult.length})
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {paginatedAdult.map((client) => (
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
                            activeClientId &&
                            activeClientId !== client.client_id
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
              {paginatedAdult.length === 0 && (
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
              {filteredAdult.length > clientsPerPage && (
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
                      cursor:
                        currentAdultPage === 1 ? "not-allowed" : "pointer",
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
      )}
    </div>
  );
}
