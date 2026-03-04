import React from "react";

const LogTable = ({ logs, loading, onLogClick }) => {
  if (loading)
    return <div className="text-center text-xl text-gray-500">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="min-w-full text-sm text-left text-gray-600">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 font-medium text-gray-800">Log ID</th>
            <th className="py-3 px-6 font-medium text-gray-800">Created At</th>
            <th className="py-3 px-6 font-medium text-gray-800">Client</th>
            <th className="py-3 px-6 font-medium text-gray-800">Description</th>
            <th className="py-3 px-6 font-medium text-gray-800">Log Type</th>
            <th className="py-3 px-6 font-medium text-gray-800">Updated By</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 px-6">
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.log_id} className="border-b hover:bg-gray-50">
                <td className="py-4 px-6">{log.log_id}</td>
                <td className="py-4 px-6">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-4 px-6">{log.clientName || "—"}</td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => onLogClick(log)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Description
                  </button>
                </td>
                <td className="py-4 px-6">{log.logType}</td>
                <td className="py-4 px-6">
                  {log.advocateName || log.clerk_user_id || "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LogTable;
