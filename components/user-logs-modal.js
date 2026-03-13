import React from "react";
import { decodeHtml } from "../src/app/utils/decode-html";

const LogModal = ({ log, onClose }) => {
  const formatDescription = (description) => {
    const content = description || "No description available";
    return content.split("\n").map((line, index) => (
      <div key={index} className="py-1 text-sm text-gray-700 leading-relaxed">
        {decodeHtml(line)}
      </div>
    ));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white/70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75M6.75 21h10.5A2.25 2.25 0 0019.5 18.75V6.108a2.25 2.25 0 00-.66-1.591L15.659 1.34A2.25 2.25 0 0014.068.75H6.75A2.25 2.25 0 004.5 3v15.75A2.25 2.25 0 006.75 21z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Log Details</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Meta info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-4">
          {log.clientName && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Client</p>
              <p className="text-sm font-semibold text-gray-800">{log.clientName}</p>
            </div>
          )}
          {log.logType && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Type</p>
              <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                log.logType === "INSERT" ? "bg-green-100 text-green-700 border border-green-200" :
                log.logType === "CREATE" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                log.logType === "UPDATE" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                log.logType === "DELETE" ? "bg-red-100 text-red-700 border border-red-200" :
                "bg-gray-100 text-gray-600 border border-gray-200"
              }`}>
                {log.logType}
              </span>
            </div>
          )}
          {log.advocateName && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Updated By</p>
              <p className="text-sm font-semibold text-gray-800">{log.advocateName}</p>
            </div>
          )}
          {log.createdAt && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Date</p>
              <p className="text-sm text-gray-700">
                {new Date(log.createdAt).toLocaleString("en-CA", {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Description</p>
          <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3 space-y-0.5">
            {formatDescription(log.description)}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(74, 0, 153, 0.8)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(97, 0, 215, 0.8)"}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogModal;
