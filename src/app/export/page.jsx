"use client";

import React, { useState } from "react";
import UserHome from "../user-home/page";
import {
  exportAllDataAction,
  exportTableAction,
  exportYouthIntakeDataAction,
} from "../lib/export-server-actions";

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("json");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const handleExportAll = async () => {
    setConfirmMessage(
      `Are you sure you want to export ALL data from the database in ${selectedFormat.toUpperCase()} format?\n\nThis will download a file containing all tables and records from the entire database.`
    );
    setConfirmAction(() => async () => {
      setShowConfirmModal(false);
      setIsExporting(true);
      setExportStatus(
        `Exporting all data in ${selectedFormat.toUpperCase()} format...`
      );

      try {
        const result = await exportAllDataAction(selectedFormat);
        if (result.success) {
          downloadFile(
            result.fileContent,
            result.fileName,
            result.mimeType,
            result.format
          );
          setExportStatus(
            `✅ All data exported successfully in ${selectedFormat.toUpperCase()} format!`
          );
        } else {
          setExportStatus(`❌ Export failed: ${result.message}`);
        }
      } catch (error) {
        setExportStatus(`❌ Export error: ${error.message}`);
      } finally {
        setIsExporting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleExportYouthIntake = async () => {
    setConfirmMessage(
      `Are you sure you want to export Youth Intake data in ${selectedFormat.toUpperCase()} format?\n\nThis will download a file containing only Youth Intake clients and their related records.`
    );
    setConfirmAction(() => async () => {
      setShowConfirmModal(false);
      setIsExporting(true);
      setExportStatus(
        `Exporting Youth Intake data in ${selectedFormat.toUpperCase()} format...`
      );

      try {
        const result = await exportYouthIntakeDataAction(selectedFormat);
        if (result.success) {
          downloadFile(
            result.fileContent,
            result.fileName,
            result.mimeType,
            result.format
          );
          setExportStatus(
            `✅ Youth Intake data exported successfully in ${selectedFormat.toUpperCase()} format!`
          );
        } else {
          setExportStatus(`❌ Export failed: ${result.message}`);
        }
      } catch (error) {
        setExportStatus(`❌ Export error: ${error.message}`);
      } finally {
        setIsExporting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleExportTable = async (tableName) => {
    setConfirmMessage(
      `Are you sure you want to export the "${tableName}" table in ${selectedFormat.toUpperCase()} format?\n\nThis will download a file containing all records from this specific table.`
    );
    setConfirmAction(() => async () => {
      setShowConfirmModal(false);
      setIsExporting(true);
      setExportStatus(
        `Exporting ${tableName} in ${selectedFormat.toUpperCase()} format...`
      );

      try {
        const result = await exportTableAction(tableName, selectedFormat);
        if (result.success) {
          downloadFile(
            result.fileContent,
            result.fileName,
            result.mimeType,
            result.format
          );
          setExportStatus(
            `✅ ${tableName} exported successfully in ${selectedFormat.toUpperCase()} format!`
          );
        } else {
          setExportStatus(`❌ Export failed: ${result.message}`);
        }
      } catch (error) {
        setExportStatus(`❌ Export error: ${error.message}`);
      } finally {
        setIsExporting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const downloadFile = (content, fileName, mimeType, format) => {
    if (format === "pdf") {
      import("../lib/saveLongPdf").then(({ saveLongPdf }) => {
        saveLongPdf(content, fileName);
      });
    } else {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage("");
  };

  const tables = [
    "Clients",
    "Childs",
    "Home Members",
    "Educational Support Persons",
    "Emergency Contacts",
    "Important Family and Friends",
    "EIA Workers",
    "Notes",
    "Advocates",
    "Assigned Advocates",
    "First Nations",
    "CFS Agencies",
    "CFS Status",
    "User Logs",
  ];

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
            <p className="text-sm text-gray-500 mt-1">Export database records in JSON, CSV, or PDF format</p>
          </div>
        </div>

        {/* Format Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
            Export Format
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="format" value="json" checked={selectedFormat === "json"} onChange={(e) => setSelectedFormat(e.target.value)} className="mr-2 w-4 h-4" style={{ accentColor: "#6100D7" }} />
                <span className="text-sm text-gray-700">JSON <span className="text-gray-400">(Structured data)</span></span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="format" value="csv" checked={selectedFormat === "csv"} onChange={(e) => setSelectedFormat(e.target.value)} className="mr-2 w-4 h-4" style={{ accentColor: "#6100D7" }} />
                <span className="text-sm text-gray-700">CSV <span className="text-gray-400">(Spreadsheet format)</span></span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="format" value="pdf" checked={selectedFormat === "pdf"} onChange={(e) => setSelectedFormat(e.target.value)} className="mr-2 w-4 h-4" style={{ accentColor: "#6100D7" }} />
                <span className="text-sm text-gray-700">PDF <span className="text-gray-400">(Text report format)</span></span>
              </label>
            </div>
          </div>
        </div>

        {/* Main Export Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Export All Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
              Export All Data
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-4">
                Export all tables from the database as a single {selectedFormat.toUpperCase()} file.
              </p>
              <button
                onClick={handleExportAll}
                disabled={isExporting}
                className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#6100D7" }}
                onMouseEnter={(e) => { if (!isExporting) e.currentTarget.style.backgroundColor = "#3a2649"; }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6100D7"}
              >
                {isExporting ? "Exporting..." : `Export All Data (${selectedFormat.toUpperCase()})`}
              </button>
            </div>
          </div>

          {/* Export Youth Intake Data */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
              Export Youth Intake Data
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-sm mb-4">
                Export only Youth Intake clients and their related data as {selectedFormat.toUpperCase()}.
              </p>
              <button
                onClick={handleExportYouthIntake}
                disabled={isExporting}
                className="w-full text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#6100D7" }}
                onMouseEnter={(e) => { if (!isExporting) e.currentTarget.style.backgroundColor = "#3a2649"; }}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6100D7"}
              >
                {isExporting ? "Exporting..." : `Export Youth Intake (${selectedFormat.toUpperCase()})`}
              </button>
            </div>
          </div>
        </div>

        {/* Individual Table Exports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
            Export Individual Tables
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-sm mb-4">Export specific tables as {selectedFormat.toUpperCase()} files.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {tables.map((tableName) => (
                <button
                  key={tableName}
                  onClick={() => handleExportTable(tableName)}
                  disabled={isExporting}
                  className="inline-flex items-center justify-center text-xs font-medium px-3 py-2 rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#B2B3D7", borderColor: "#9899C0", color: "#6100D7" }}
                  onMouseEnter={(e) => { if (!isExporting) e.currentTarget.style.backgroundColor = "#9899C0"; }}
                  onMouseLeave={(e) => { if (!isExporting) e.currentTarget.style.backgroundColor = "#B2B3D7"; }}
                >
                  {isExporting ? "..." : `${tableName} (${selectedFormat.toUpperCase()})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status Display */}
        {exportStatus && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 border-l-4" style={{ borderLeftColor: "#6100D7" }}>
            <div className="p-4">
              <p className="text-gray-700 text-sm font-medium">{exportStatus}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#6100D7" }}>
            Export Instructions
          </div>
          <div className="p-6">
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• <strong>JSON Format:</strong> Structured data format, best for data analysis and processing</li>
              <li>• <strong>CSV Format:</strong> Spreadsheet-compatible format, opens in Excel, Google Sheets, etc.</li>
              <li>• <strong>PDF Format:</strong> Text-based report format, good for printing and sharing</li>
              <li>• <strong>Export All Data:</strong> Downloads a comprehensive file with all database tables</li>
              <li>• <strong>Export Youth Intake Data:</strong> Downloads only Youth Intake clients and related records</li>
              <li>• <strong>Individual Tables:</strong> Export specific tables as separate files</li>
              <li>• Files are automatically downloaded to your default downloads folder</li>
              <li>• <strong>Confirmation:</strong> You will be asked to confirm before each export</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4" style={{ backgroundColor: "#6100D7" }}>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h3 className="ml-3 text-base font-semibold text-white">Confirm Export</h3>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{confirmMessage}</p>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
                  style={{ backgroundColor: "#6100D7" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3a2649"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#6100D7"}
                >
                  Confirm Export
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </UserHome>
  );
}
