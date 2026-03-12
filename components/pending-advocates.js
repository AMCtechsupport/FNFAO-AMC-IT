"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/nextjs";

const SORT_OPTIONS = [
  { value: "az", label: "Name (A–Z)" },
  { value: "za", label: "Name (Z–A)" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
];

const applySort = (list, sort) => {
  const sorted = [...list];
  switch (sort) {
    case "za":
      return sorted.sort((a, b) =>
        (b.firstName + " " + b.lastName).localeCompare(a.firstName + " " + a.lastName)
      );
    case "newest":
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    default:
      return sorted.sort((a, b) =>
        (a.firstName + " " + a.lastName).localeCompare(b.firstName + " " + b.lastName)
      );
  }
};

const PendingAdvocates = ({ refreshTrigger }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const [allAdvocates, setAllAdvocates] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortValue, setSortValue] = useState("newest");
  const [openFilterFor, setOpenFilterFor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resendingFor, setResendingFor] = useState(null);
  const [deletingFor, setDeletingFor] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch pending advocates
  const fetchPendingAdvocates = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/pending-advocates`, { cache: "no-store" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const msg = json?.error || `Status ${res.status}`;
        console.error("Error fetching pending advocates:", msg);
        setError(msg);
        return;
      }
      const json = await res.json();
      const advocatesList = json.advocates || [];
      setAllAdvocates(advocatesList);
      setAdvocates(advocatesList);
    } catch (err) {
      console.error("Unexpected error while fetching pending advocates:", err);
      setError("Unexpected error occurred while fetching pending advocates.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchPendingAdvocates();
  }, []);

  // Refetch when auth state changes (e.g., when user signs in)
  useEffect(() => {
    if (isLoaded) {
      fetchPendingAdvocates();
    }
  }, [isLoaded, isSignedIn]);

  // Refetch when a new advocate is created
  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchPendingAdvocates();
    }
  }, [refreshTrigger]);

  // Handle search
  const filteredAdvocates = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return applySort(allAdvocates, sortValue);
    }

    const filtered = allAdvocates.filter((advocate) => {
      const firstName = (advocate.firstName || "").toLowerCase();
      const lastName = (advocate.lastName || "").toLowerCase();
      const email = (advocate.email || "").toLowerCase();

      return (
        firstName.includes(term) ||
        lastName.includes(term) ||
        email.includes(term)
      );
    });

    return applySort(filtered, sortValue);
  }, [searchTerm, allAdvocates, sortValue]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setError(null);
    setSuccess(null);
  };

  const handleResendEmail = async (advocate) => {
    setResendingFor(advocate.advocate_id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/resend-invitation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: advocate.firstName,
          lastName: advocate.lastName,
          email: advocate.email,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json?.error || `Status ${res.status}`;
        setError(`Failed to resend email: ${errorMsg}`);
        return;
      }

      setSuccess(`Email resent to ${advocate.email}`);
      // Refresh the list
      await fetchPendingAdvocates();
    } catch (err) {
      console.error("Error resending email:", err);
      setError("Error resending email. Please try again.");
    } finally {
      setResendingFor(null);
    }
  };

  const handleDelete = async (advocate) => {
    setDeletingFor(advocate.advocate_id);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/delete-advocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advocate_id: advocate.advocate_id }),
      });

      let json = {};
      try {
        const text = await res.text();
        if (text) {
          json = JSON.parse(text);
        }
      } catch (parseErr) {
        console.error("Failed to parse JSON response:", parseErr);
      }

      if (!res.ok) {
        const errorMsg = json?.error || `Status ${res.status}`;
        setError(`Failed to delete: ${errorMsg}`);
        return;
      }

      setSuccess(`${advocate.firstName} ${advocate.lastName} deleted successfully`);
      // Refresh the list
      await fetchPendingAdvocates();
    } catch (err) {
      console.error("Error deleting advocate:", err);
      setError("Error deleting user. Please try again.");
    } finally {
      setDeletingFor(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
          Pending Requests
        </div>
        <div className="p-6">
          <p className="text-gray-600">Loading pending advocates…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
        Pending User Request
      </div>

      <div className="p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by name or email"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg shadow-sm placeholder-gray-400 text-gray-700 focus:outline-none transition"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenFilterFor((prev) => (prev === "sort" ? null : "sort"))}
                className="border border-gray-300 rounded-xl px-3 py-2.5 bg-white text-gray-700 font-semibold flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap"
                title="Sort order"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 5h14M6 10h8M9 15h2"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm">
                  {SORT_OPTIONS.find((o) => o.value === sortValue)?.label}
                </span>
              </button>

              {openFilterFor === "sort" && (
                <div className="absolute right-0 top-12 z-10 bg-white border border-gray-300 rounded-2xl shadow-sm w-40 overflow-hidden">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSortValue(option.value);
                        setOpenFilterFor(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-semibold ${
                        sortValue === option.value
                          ? "bg-gray-100 text-gray-800"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* List of pending advocates */}
        {filteredAdvocates.length > 0 ? (
          <div className="space-y-3">
            {filteredAdvocates.map((advocate) => (
              <div
                key={advocate.advocate_id}
                className="border border-gray-300 rounded-3xl px-6 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                  <p className="md:basis-1/2 md:shrink-0 md:min-w-0 text-lg font-semibold text-gray-800 truncate">
                    {advocate.firstName} {advocate.lastName}
                  </p>
                  <p className="min-w-0 text-base font-semibold text-gray-600 truncate">
                    {advocate.email}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="min-w-[7rem] text-center text-xs font-medium px-2.5 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Awaiting Signup
                  </span>

                  <button
                    type="button"
                    onClick={() => handleResendEmail(advocate)}
                    disabled={resendingFor === advocate.advocate_id || deletingFor === advocate.advocate_id}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {resendingFor === advocate.advocate_id ? "Sending..." : "Resend Email"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(advocate)}
                    disabled={deletingFor === advocate.advocate_id || resendingFor === advocate.advocate_id}
                    className="px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    style={{
                      color: "#C00707",
                      backgroundColor: "#FDE8E8",
                      borderColor: "#C00707",
                    }}
                    onMouseEnter={(e) => !(deletingFor === advocate.advocate_id || resendingFor === advocate.advocate_id) && (e.currentTarget.style.backgroundColor = "#FCC8C8")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FDE8E8")}
                  >
                    {deletingFor === advocate.advocate_id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm font-medium">No pending requests yet.</p>
            <p className="text-xs mt-1">Newly created advocates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingAdvocates;
