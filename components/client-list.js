"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "../src/app/lib/supabase";

export default function ClientsList({ initialClients, totalCount }) {
  const [clients, setClients] = useState(initialClients);
  const [search, setSearch] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [deletingClientId, setDeletingClientId] = useState(null);
  
  // New state for total counts from database
  const [totalYouthClients, setTotalYouthClients] = useState(0);
  const [totalAdultClients, setTotalAdultClients] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(totalCount / 10));
  const [clientsPerPage, setClientsPerPage] = useState(10);
  const clientsPerPageOptions = [5, 10, 15, 20];

  const router = useRouter();

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
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age <= 20 ? "Youth" : "Adult";
    }
  };

  // Fetch total counts from database
  const fetchTotalCounts = async () => {
    try {
      // Get total Youth clients (clientType = "Youth Intake")
      const { count: youthCount, error: youthError } = await supabase
        .from("Clients")
        .select("*", { count: "exact", head: true })
        .eq("clientType", "Youth Intake");

      if (youthError) {
        console.error("Error fetching youth count:", youthError);
      } else {
        setTotalYouthClients(youthCount || 0);
      }

      // Get total Adult clients (clientType = "Pre-Intake")
      const { count: adultCount, error: adultError } = await supabase
        .from("Clients")
        .select("*", { count: "exact", head: true })
        .eq("clientType", "Pre-Intake");

      if (adultError) {
        console.error("Error fetching adult count:", adultError);
      } else {
        setTotalAdultClients(adultCount || 0);
      }
    } catch (err) {
      console.error("Unexpected error fetching total counts:", err);
    }
  };

  // Handle edit button click
  const handleEdit = (client) => {
    const clientType = getClientTypeLabel(client);
    
    if (clientType === "Youth") {
      // Redirect Youth clients to youth-clients form for editing
      router.push(`/youth-clients/${client.client_id}`);
    } else {
      // Redirect Adult clients to full-intake form for editing
      router.push(`/clients/${client.client_id}`);
    }
  };

  // Handle delete button click
  const handleDelete = async (client) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete ${client.firstName} ${client.lastName}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    setDeletingClientId(client.client_id);

    try {
      // Delete related data first (foreign key constraints)
      
      // Delete Emergency Contacts
      await supabase
        .from("Emergency Contacts")
        .delete()
        .eq("client_id", client.client_id);

      // Delete Home Members
      await supabase
        .from("Home Members")
        .delete()
        .eq("client_id", client.client_id);

      // Delete Educational Support Persons (if exists for youth clients)
      await supabase
        .from("Educational Support Persons")
        .delete()
        .eq("client_id", client.client_id);

      // Delete Children (if exists for adult clients)
      await supabase
        .from("Childs")
        .delete()
        .eq("client_id", client.client_id);

      // Delete Notes
      await supabase
        .from("Notes")
        .delete()
        .eq("client_id", client.client_id);

      // Delete Important Family and Friends
      await supabase
        .from("Important Family and Friends")
        .delete()
        .eq("client_id", client.client_id);

      // Delete EIA Workers
      await supabase
        .from("EIA Workers")
        .delete()
        .eq("client_id", client.client_id);

      // Delete Assigned Advocates
      await supabase
        .from("Assigned Advocates")
        .delete()
        .eq("client_id", client.client_id);

      // Finally, delete the client
      const { error: clientError } = await supabase
        .from("Clients")
        .delete()
        .eq("client_id", client.client_id);

      if (clientError) {
        throw clientError;
      }

      // Remove client from local state
      setClients(prevClients => 
        prevClients.filter(c => c.client_id !== client.client_id)
      );

      // Refresh total counts after deletion
      fetchTotalCounts();

      alert(`${client.firstName} ${client.lastName} has been successfully deleted.`);

    } catch (error) {
      console.error("Error deleting client:", error);
      alert(`Failed to delete client: ${error.message}`);
    } finally {
      setDeletingClientId(null);
    }
  };

  // Fetch clients for the current page and search term
  const fetchClients = async (
    page = 1,
    searchQuery = "",
    dateOfBirthQuery = ""
  ) => {
    try {
      let query = supabase
        .from("Clients")
        .select("*", { count: "exact" })
        .range((page - 1) * clientsPerPage, page * clientsPerPage - 1)
        .order("createdAt", { ascending: false });

      if (searchQuery) {
        const isNumeric = !isNaN(searchQuery);

        if (isNumeric) {
          query = query.eq("client_id", parseInt(searchQuery, 10));
        } else {
          query = query.or(
            `firstName.ilike.%${searchQuery}%,middleName.ilike.%${searchQuery}%,lastName.ilike.%${searchQuery}%`
          );
        }
      }

      // Handle Date of Birth search query (only if provided)
      if (dateOfBirthQuery) {
        query = query.eq("dateOfBirth", dateOfBirthQuery);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error("Error fetching data:", error.message);
      } else {
        setClients(data);
        setTotalPages(Math.ceil(count / clientsPerPage));
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchClients(currentPage, search, dateOfBirth);
  }, [currentPage, search, dateOfBirth, clientsPerPage]);

  // Fetch total counts on component mount
  useEffect(() => {
    fetchTotalCounts();
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handleDateOfBirthChange = (event) => {
    setDateOfBirth(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleClientsPerPageChange = (event) => {
    setClientsPerPage(parseInt(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div style={{ 
      padding: '24px',
      maxWidth: '1280px',
      margin: '0 auto'
    }}>
      <h1 style={{ 
        fontSize: '30px',
        fontWeight: 'bold',
        marginBottom: '32px',
        color: '#1f2937'
      }}>
        List of Clients
      </h1>
      
      {/* Search and Filter Section */}
      <div style={{ 
        marginBottom: '32px',
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ 
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: '#374151'
        }}>
          Search & Filter Options
        </h2>
        <div style={{ 
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          justifyContent: 'center'
        }}>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={search}
            onChange={handleSearchChange}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px',
              outline: 'none'
            }}
          />
          <input
            type="date"
            placeholder="Search by Date of Birth"
            value={dateOfBirth}
            onChange={handleDateOfBirthChange}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <select
            value={clientsPerPage}
            onChange={handleClientsPerPageChange}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {clientsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '32px'
      }}>
        {/* Youth Clients Column */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#1d4ed8',
            textAlign: 'center'
          }}>
            Total Youth Clients ({totalYouthClients})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clients
              .filter(client => getClientTypeLabel(client) === "Youth")
              .map((client) => (
                <div key={client.client_id} style={{ 
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  const buttons = e.target.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = '1';
                    buttons.style.visibility = 'visible';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  const buttons = e.target.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = '0';
                    buttons.style.visibility = 'hidden';
                  }
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '8px',
                        fontSize: '16px'
                      }}>
                        {client.firstName} {client.lastName}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: '500' }}>First Nation:</span>{" "}
                        {client.firstNationMembership || 'N/A'}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        <span style={{ fontWeight: '500' }}>DOB:</span>{" "}
                        {new Date(client.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div data-buttons="true" style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginLeft: '16px',
                      opacity: '0',
                      visibility: 'hidden',
                      transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out'
                    }}>
                      <button
                        onClick={() => handleEdit(client)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#2563eb';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#3b82f6';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        disabled={deletingClientId === client.client_id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: deletingClientId === client.client_id ? '#9ca3af' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: deletingClientId === client.client_id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          opacity: deletingClientId === client.client_id ? 0.6 : 1
                        }}
                        onMouseOver={(e) => {
                          if (deletingClientId !== client.client_id) {
                            e.target.style.backgroundColor = '#b91c1c';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (deletingClientId !== client.client_id) {
                            e.target.style.backgroundColor = '#dc2626';
                          }
                        }}
                      >
                        {deletingClientId === client.client_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {clients.filter(client => getClientTypeLabel(client) === "Youth").length === 0 && (
              <div style={{ 
                textAlign: 'center',
                color: '#6b7280',
                fontStyle: 'italic',
                padding: '32px'
              }}>
                No youth clients found
              </div>
            )}
          </div>
        </div>

        {/* Adult Clients Column */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '24px',
            color: '#059669',
            textAlign: 'center'
          }}>
            Total Adult Clients ({totalAdultClients})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {clients
              .filter(client => getClientTypeLabel(client) === "Adult")
              .map((client) => (
                <div key={client.client_id} style={{ 
                  backgroundColor: '#f9fafb',
                  padding: '16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  const buttons = e.target.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = '1';
                    buttons.style.visibility = 'visible';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f9fafb';
                  const buttons = e.target.querySelector('[data-buttons="true"]');
                  if (buttons) {
                    buttons.style.opacity = '0';
                    buttons.style.visibility = 'hidden';
                  }
                }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ flex: '1' }}>
                      <div style={{ 
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '8px',
                        fontSize: '16px'
                      }}>
                        {client.firstName} {client.lastName}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontWeight: '500' }}>First Nation:</span>{" "}
                        {client.firstNationMembership || 'N/A'}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#6b7280'
                      }}>
                        <span style={{ fontWeight: '500' }}>DOB:</span>{" "}
                        {new Date(client.dateOfBirth).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div data-buttons="true" style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      marginLeft: '16px',
                      opacity: '0',
                      visibility: 'hidden',
                      transition: 'opacity 0.2s ease-in-out, visibility 0.2s ease-in-out'
                    }}>
                      <button
                        onClick={() => handleEdit(client)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#15803d';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = '#16a34a';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
                        disabled={deletingClientId === client.client_id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: deletingClientId === client.client_id ? '#9ca3af' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: deletingClientId === client.client_id ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          opacity: deletingClientId === client.client_id ? 0.6 : 1
                        }}
                        onMouseOver={(e) => {
                          if (deletingClientId !== client.client_id) {
                            e.target.style.backgroundColor = '#b91c1c';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (deletingClientId !== client.client_id) {
                            e.target.style.backgroundColor = '#dc2626';
                          }
                        }}
                      >
                        {deletingClientId === client.client_id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            {clients.filter(client => getClientTypeLabel(client) === "Adult").length === 0 && (
              <div style={{ 
                textAlign: 'center',
                color: '#6b7280',
                fontStyle: 'italic',
                padding: '32px'
              }}>
                No adult clients found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      {clients.length > 0 && (
        <div style={{ 
          marginTop: '32px',
          backgroundColor: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : '#f9fafb',
                color: currentPage === 1 ? '#9ca3af' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                if (currentPage !== 1) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== 1) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
            >
              Previous
            </button>
            <span style={{ 
              fontSize: '14px',
              color: '#6b7280',
              padding: '0 16px'
            }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#f9fafb',
                color: currentPage === totalPages ? '#9ca3af' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onMouseOver={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.backgroundColor = '#f9fafb';
                }
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
