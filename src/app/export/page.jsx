"use client";

import React, { useState } from "react";
import UserHome from "../user-home/page";
import { exportAllData, exportTable, exportYouthIntakeData } from "../utils/exportData.js";

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
      setExportStatus(`Exporting all data in ${selectedFormat.toUpperCase()} format...`);
      
      try {
        const result = await exportAllData(selectedFormat);
        if (result.success) {
          setExportStatus(`✅ All data exported successfully in ${selectedFormat.toUpperCase()} format!`);
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
      setExportStatus(`Exporting Youth Intake data in ${selectedFormat.toUpperCase()} format...`);
      
      try {
        const result = await exportYouthIntakeData(selectedFormat);
        if (result.success) {
          setExportStatus(`✅ Youth Intake data exported successfully in ${selectedFormat.toUpperCase()} format!`);
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
      setExportStatus(`Exporting ${tableName} in ${selectedFormat.toUpperCase()} format...`);
      
      try {
        const result = await exportTable(tableName, selectedFormat);
        if (result.success) {
          setExportStatus(`✅ ${tableName} exported successfully in ${selectedFormat.toUpperCase()} format!`);
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

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage("");
    setExportStatus("Export cancelled by user.");
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
    "User Logs"
  ];

  return (
    <UserHome>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Data Export</h1>
        
        {/* Format Selection */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Export Format</h2>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="json"
                checked={selectedFormat === "json"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">JSON (Structured data)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={selectedFormat === "csv"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">CSV (Spreadsheet format)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="txt"
                checked={selectedFormat === "txt"}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="mr-2"
              />
              <span className="text-gray-700">TXT (Text report format)</span>
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export All Data */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Export All Data</h2>
            <p className="text-gray-600 mb-4">
              Export all tables from the database as a single {selectedFormat.toUpperCase()} file.
            </p>
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isExporting ? "Exporting..." : `Export All Data (${selectedFormat.toUpperCase()})`}
            </button>
          </div>

          {/* Export Youth Intake Data */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Export Youth Intake Data</h2>
            <p className="text-gray-600 mb-4">
              Export only Youth Intake clients and their related data as {selectedFormat.toUpperCase()}.
            </p>
            <button
              onClick={handleExportYouthIntake}
              disabled={isExporting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {isExporting ? "Exporting..." : `Export Youth Intake Data (${selectedFormat.toUpperCase()})`}
            </button>
          </div>
        </div>

        {/* Individual Table Exports */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Export Individual Tables</h2>
          <p className="text-gray-600 mb-4">
            Export specific tables as {selectedFormat.toUpperCase()} files.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((tableName) => (
              <button
                key={tableName}
                onClick={() => handleExportTable(tableName)}
                disabled={isExporting}
                className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-md transition-colors text-sm"
              >
                {isExporting ? "..." : `${tableName} (${selectedFormat.toUpperCase()})`}
              </button>
            ))}
          </div>
        </div>

        {/* Status Display */}
        {exportStatus && (
          <div className="mt-6 p-4 rounded-md bg-gray-50 border border-gray-200">
            <p className="text-sm font-medium text-gray-700">{exportStatus}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-blue-800">Export Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>• <strong>JSON Format:</strong> Structured data format, best for data analysis and processing</li>
            <li>• <strong>CSV Format:</strong> Spreadsheet-compatible format, opens in Excel, Google Sheets, etc.</li>
            <li>• <strong>TXT Format:</strong> Text-based report format, good for printing and sharing</li>
            <li>• <strong>Export All Data:</strong> Downloads a comprehensive file with all database tables</li>
            <li>• <strong>Export Youth Intake Data:</strong> Downloads only Youth Intake clients and related records</li>
            <li>• <strong>Individual Tables:</strong> Export specific tables as separate files</li>
            <li>• Files are automatically downloaded to your default downloads folder</li>
            <li>• Check the browser console for detailed export progress and any errors</li>
            <li>• <strong>Confirmation:</strong> You will be asked to confirm before each export</li>
          </ul>
        </div>

        {/* Custom Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Confirm Export</h3>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {confirmMessage}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Confirm Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </UserHome>
  );
} 