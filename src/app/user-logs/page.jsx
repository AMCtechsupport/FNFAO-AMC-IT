"use client";

import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import LogTable from "../../../components/user-logs-table";
import SearchBar from "../../../components/user-logs-search";
import LogModal from "../../../components/user-logs-modal";
import Pagination from "../../../components/report/pages-pagination";

import UserHome from "../user-home/page";

const UserLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);

  // Compute total pages for the pagination component
  const totalPages = totalLogs > 0 ? Math.ceil(totalLogs / itemsPerPage) : 0;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        pageSize: String(itemsPerPage),
      });
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/user-logs?${params.toString()}`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        console.error("Error fetching user logs", json.error || res.status);
        setLoading(false);
        return;
      }

      const json = await res.json();
      const total = json.count ?? 0;

      setLogs(json.logs || []);
      setTotalLogs(total);

      // Clamp current page if it's now out of range
      const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
      setLoading(false);
    };

    fetchLogs();

    // Real-time subscription: re-fetch via API when User Logs table changes
    const logsChannel = supabase
      .channel("user-logs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User Logs" },
        (payload) => {
          console.log("Change received in User Logs table:", payload);
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      logsChannel.unsubscribe();
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
    <UserHome>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
              <p className="text-sm text-gray-500 mt-1">Track all system activity and client updates</p>
            </div>
            {!loading && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                {totalLogs} {totalLogs === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar value={searchQuery} onSearchChange={handleSearchChange} />

        {/* Log Table */}
        <LogTable logs={logs} loading={loading} onLogClick={setSelectedLog} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        {/* Modal */}
        {selectedLog && (
          <LogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        )}
      </div>
    </UserHome>
  );
};

export default UserLogs;
