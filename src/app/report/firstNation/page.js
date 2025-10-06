"use client";

import UserHome from "../../user-home/page";
import { useState } from "react";

export default function FirstNationsReportPage() {
  const [community, setCommunity] = useState("");
  const [agency, setAgency] = useState("");
  const [ageGroup, setAgeGroup] = useState("");

  const handleFind = () => {
    console.log("Filters applied:", { community, agency, ageGroup });
  };

  const handleDownloadAll = () => {
    console.log("Downloading all reports...");
  };

  return (
    <UserHome>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            First Nations Report
          </h1>

          <div className="space-y-6 bg-white shadow-md rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Community Dropdown */}
              <div>
                <label className="block font-semibold mb-2">Select Community</label>
                <select
                  value={community}
                  onChange={(e) => setCommunity(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select Community</option>
                  <option value="community1">Community 1</option>
                  <option value="community2">Community 2</option>
                </select>
              </div>

              {/* Agency Dropdown */}
              <div>
                <label className="block font-semibold mb-2">Select Agency</label>
                <select
                  value={agency}
                  onChange={(e) => setAgency(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select Agency</option>
                  <option value="agency1">Agency 1</option>
                  <option value="agency2">Agency 2</option>
                </select>
              </div>

              {/* Age Group Dropdown */}
              <div>
                <label className="block font-semibold mb-2">Select Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2"
                >
                  <option value="">Select Age Group</option>
                  <option value="child">Children (0-12)</option>
                  <option value="teen">Teens (13-19)</option>
                  <option value="adult">Adults (20-59)</option>
                  <option value="senior">Seniors (60+)</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3 mt-6">
              <button
                onClick={handleFind}
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Find
              </button>
              <button
                onClick={handleDownloadAll}
                className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition"
              >
                Download All
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserHome>
  );
}
