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
      // Request exact count from Supabase so pagination can work correctly
      let query = supabase
        .from("User Logs")
        .select("*, Advocates!advocate_id(firstName, lastName)", { count: "exact" });

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
        setLoading(false);
        return;
      }

      const logsData = data || [];

      // Attach advocateName to each log using the joined Advocates data
      const enrichedLogs = logsData.map((log) => ({
        ...log,
        advocateName: log.Advocates
          ? `${log.Advocates.firstName} ${log.Advocates.lastName}`
          : null,
      }));

      setLogs(enrichedLogs);
      const total = typeof count === "number" ? count : logsData.length;
      setTotalLogs(total);

      // If the current page is now out-of-range (e.g., total decreased), clamp it
      const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
      if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }
      setLoading(false);
    };

    fetchLogs();

    // Real-time subscription to changes in the "User Logs" table so the UI updates
    const logsChannel = supabase
      .channel("user-logs-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User Logs" },
        (payload) => {
          // When User Logs change (INSERT/UPDATE/DELETE), refresh the displayed logs
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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">User Logs</h1>

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
