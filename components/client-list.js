"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteClient } from "../src/app/lib/delete-client-server";
import Pagination from "./report/pages-pagination";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ToastNotification from "./ToastNotification";
import SortDropdown from "./sort-dropdown";

//Status filter dropdown options
const statusOptions = [
  { value: "all", label: "All Clients" },
  { value: "active", label: "Active Clients" },
  { value: "inactive", label: "Inactive Clients" },
  { value: "ciwg", label: "Critical Incident Working Group" },
];

const formTypeBadge = (type) => {
  const isYouth = type === "Youth";
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
        isYouth
          ? "bg-blue-100 text-blue-700 border border-blue-200"
          : "bg-green-100 text-green-700 border border-green-200"
      }`}
    >
      {type}
    </span>
  );
};

function ClientTable({
  title,
  clients,
  paginated,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onDelete,
  activeClientId,
  deletingClientId,
  emptyMessage,
}) {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(240, 238, 246, 0.8)", color: "rgba(97, 0, 215, 0.8)", border: "1px solid rgba(178, 179, 215, 0.8)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-white" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-center">Name</th>
              <th className="py-3 px-4 font-semibold text-xs uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center py-12 px-4">
                  <div className="flex flex-col items-center text-gray-400">
                    <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((client, index) => {
                const fullName = [client.firstName, client.lastName]
                  .filter(Boolean)
                  .join(" ");
                const isDeleting = deletingClientId === client.client_id;
                const isOpening = activeClientId === client.client_id;
                const isBusy = activeClientId !== null || deletingClientId !== null;

                return (
                  <tr
                    key={client.client_id}
                    className={`transition-colors hover:bg-gray-50 ${index % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                  >
                    <td className="py-3 px-4 font-medium text-gray-800 text-center">{fullName || "—"}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onView(client)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "rgba(97, 0, 215, 0.08)", borderColor: "rgba(97, 0, 215, 0.24)", color: "rgba(97, 0, 215, 0.8)", transition: "all 0.3s ease" }}
                          onMouseEnter={e => { if (!isBusy) { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"; e.currentTarget.style.color = "#ffffff"; } }}
                          onMouseLeave={e => { if (!isBusy) { e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.08)"; e.currentTarget.style.color = "rgba(97, 0, 215, 0.8)"; } }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {isOpening ? "Opening..." : "View"}
                        </button>
                        <button
                          onClick={() => onDelete(client)}
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)", color: "#ef4444", transition: "all 0.3s ease" }}
                          onMouseEnter={e => { if (!isBusy) { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; } }}
                          onMouseLeave={e => { if (!isBusy) { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"; e.currentTarget.style.color = "#ef4444"; } }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default function ClientsList() {
  const [allYouthClients, setAllYouthClients] = useState([]);
  const [allAdultClients, setAllAdultClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingClientId, setDeletingClientId] = useState(null);
  const [activeClientId, setActiveClientId] = useState(null);
  const [currentYouthPage, setCurrentYouthPage] = useState(1);
  const [currentAdultPage, setCurrentAdultPage] = useState(1);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const clientsPerPage = 10;
  const router = useRouter();
  // Stores the selected sorting option from the dropdown
  // default = newest clients first
  const [sortOption, setSortOption] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filterClients = (clients) => {
    return clients.filter((client) => {

        // SEARCH
        const fullName = `${client.firstName || ""} ${client.lastName || ""}`.toLowerCase();
        const matchesSearch = fullName.includes(searchQuery.toLowerCase());

        // STATUS FILTER
          if (statusFilter === "active") {
          return matchesSearch && client.clientStatus === "Active";
          
        } else if (statusFilter === "inactive") {
          return matchesSearch && client.clientStatus === "Inactive";
        
        } else if (statusFilter === "ciwg") {
          return matchesSearch && client.clientStatus === "Critical Incident Working Group";
        }
        
        else {
          return matchesSearch; // "all"
        }
      });
    };

    // Function that sorts clients based on the dropdown selection
  const sortClients = (clients) => {

    // Create a copy of the array so React state isn't mutated
    let sorted = [...clients];

    // NEWEST FIRST
    if (sortOption === "newest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // OLDEST FIRST
    else if (sortOption === "oldest") {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // ALPHABETICAL A → Z
    else if (sortOption === "az") {
      sorted.sort((a, b) => {
        const nameA = `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase();
        const nameB = `${b.firstName ?? ""} ${b.lastName ?? ""}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    // ALPHABETICAL Z → A
    else if (sortOption === "za") {
      sorted.sort((a, b) => {
        const nameA = `${a.firstName ?? ""} ${a.lastName ?? ""}`.toLowerCase();
        const nameB = `${b.firstName ?? ""} ${b.lastName ?? ""}`.toLowerCase();
        return nameB.localeCompare(nameA);
      });
    }

    return sorted;
  };
  

  // First filter clients by search
  // Then apply sorting
  const filteredYouth = sortClients(filterClients(allYouthClients));
  const filteredAdult = sortClients(filterClients(allAdultClients));

  const totalYouthPages = Math.max(1, Math.ceil(filteredYouth.length / clientsPerPage));
  const totalAdultPages = Math.max(1, Math.ceil(filteredAdult.length / clientsPerPage));

  const paginatedYouth = filteredYouth.slice(
    (currentYouthPage - 1) * clientsPerPage,
    currentYouthPage * clientsPerPage,
  );
  const paginatedAdult = filteredAdult.slice(
    (currentAdultPage - 1) * clientsPerPage,
    currentAdultPage * clientsPerPage,
  );

  const handleView = (client) => {
    setActiveClientId(client.client_id);
    setTimeout(() => {
      if (client.clientType === "Youth Intake") {
        router.push(`/youth-clients/${client.client_id}/view`);
      } else {
        router.push(`/adult-clients/${client.client_id}/view`);
      }
    }, 50);
  };

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
  };

  const handleConfirmDelete = async () => {
    const client = clientToDelete;
    setClientToDelete(null);
    setDeletingClientId(client.client_id);
    try {
      const result = await deleteClient(client.client_id);
      setAllYouthClients((prev) => prev.filter((c) => c.client_id !== client.client_id));
      setAllAdultClients((prev) => prev.filter((c) => c.client_id !== client.client_id));
      showToast("success", result.message);
    } catch (error) {
      console.error("Error deleting client:", error);
      showToast("error", `Failed to delete client: ${error.message}`);
    } finally {
      setDeletingClientId(null);
    }
  };

  const handleCancelDelete = () => {
    setClientToDelete(null);
  };

  return (
    <div className="py-4">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">List of Clients</h1>
          <p className="text-sm text-gray-500 mt-1">All youth and adult clients in the system</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(240, 238, 246, 0.8)", color: "rgba(97, 0, 215, 0.8)", border: "1px solid rgba(178, 179, 215, 0.8)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {allYouthClients.length + allAdultClients.length} total
        </span>
      </div>

      {/* Filter + Sort */}
      <div className="flex justify-end gap-3 pb-4">

        {/* Status Filter */}
        <SortDropdown
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentYouthPage(1);
            setCurrentAdultPage(1);
          }}
          options={statusOptions}
        />

        {/* Sort Dropdown (your existing one) */}
        <SortDropdown
          value={sortOption}
          onChange={(value) => {
            setSortOption(value);
            setCurrentYouthPage(1);
            setCurrentAdultPage(1);
          }}
        />

      </div>

       {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentYouthPage(1); setCurrentAdultPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <svg className="animate-spin h-8 w-8 mb-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span className="text-sm">Loading clients...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Youth Clients */}
          <ClientTable
            title="Youth Clients"
            clients={filteredYouth}
            paginated={paginatedYouth}
            currentPage={currentYouthPage}
            totalPages={totalYouthPages}
            onPageChange={setCurrentYouthPage}
            onView={handleView}
            onDelete={handleDeleteClick}
            activeClientId={activeClientId}
            deletingClientId={deletingClientId}
            emptyMessage="No youth clients found"
          />

          {/* Adult Clients */}
          <ClientTable
            title="Adult Clients"
            clients={filteredAdult}
            paginated={paginatedAdult}
            currentPage={currentAdultPage}
            totalPages={totalAdultPages}
            onPageChange={setCurrentAdultPage}
            onView={handleView}
            onDelete={handleDeleteClick}
            activeClientId={activeClientId}
            deletingClientId={deletingClientId}
            emptyMessage="No adult clients found"
          />
        </div>
      )}

      <DeleteConfirmModal
        client={clientToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
      <ToastNotification toast={toast} />
    </div>
  );
}
