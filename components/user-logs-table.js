import React from "react";

const logTypeBadge = (type) => {
  const styles = {
    INSERT: "bg-green-100 text-green-700 border border-green-200",
    CREATE: "bg-blue-100 text-blue-700 border border-blue-200",
    UPDATE: "bg-amber-100 text-amber-700 border border-amber-200",
    DELETE: "bg-red-100 text-red-700 border border-red-200",
  };
  const label = type || "—";
  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
        styles[label] || "bg-gray-100 text-gray-600 border border-gray-200"
      }`}
    >
      {label}
    </span>
  );
};

const LogTable = ({ logs, loading, onLogClick }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg
          className="animate-spin h-8 w-8 mb-3 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <span className="text-sm">Loading logs...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-white" style={{ backgroundColor: "#6100D7" }}>
              <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Log ID</th>
              <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Created At</th>
              <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Client</th>
              <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Description</th>
              <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Log Type</th>
              <th className="py-3.5 px-5 font-semibold text-xs uppercase tracking-wider">Updated By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-16 px-6">
                  <div className="flex flex-col items-center text-gray-400">
                    <svg className="w-10 h-10 mb-3 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M6.75 21h10.5A2.25 2.25 0 0019.5 18.75V6.108a2.25 2.25 0 00-.66-1.591L15.659 1.34A2.25 2.25 0 0014.068 .75H6.75A2.25 2.25 0 004.5 3v15.75A2.25 2.25 0 006.75 21z" />
                    </svg>
                    <p className="text-sm font-medium">No logs found</p>
                    <p className="text-xs mt-1">Try adjusting your search</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log, index) => (
                <tr
                  key={log.log_id}
                  className={`transition-colors hover:bg-gray-50 ${
                    index % 2 !== 0 ? "bg-gray-50/50" : ""
                  }`}
                >
                  <td className="py-3.5 px-5 text-gray-400 font-mono text-xs">#{log.log_id}</td>
                  <td className="py-3.5 px-5 text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-CA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    <span className="block text-xs text-gray-400">
                      {new Date(log.createdAt).toLocaleTimeString("en-CA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-medium text-gray-800">
                    {log.clientName || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => onLogClick(log)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors border"
                      style={{ backgroundColor: "#B2B3D7", borderColor: "#9899C0", color: "#6100D7" }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#9899C0"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#B2B3D7"}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      View
                    </button>
                  </td>
                  <td className="py-3.5 px-5">{logTypeBadge(log.logType)}</td>
                  <td className="py-3.5 px-5 text-gray-700">
                    {log.advocateName || log.clerk_user_id || <span className="text-gray-400">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
