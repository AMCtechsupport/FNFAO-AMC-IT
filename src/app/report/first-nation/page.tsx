"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserHome from "../../user-home/page";
import FirstNationFilters from "../../../../components/report/first-nation-filters";
import DateFilterPage from "../../../../components/report/date-range-filter.js";
import ReportPreview from "../../../../components/report/report-preview";
import DataColumn from "../../../../components/data-collection/data-column";

export default function FirstNationsReportPage() {
  const [showPreview, setShowPreview] = useState(false);
  const [community, setCommunity] = useState("");
  const [agency, setAgency] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [validationError, setValidationError] = useState("");

  const router = useRouter();

  // It handles the Find button click validation
  const handleFind = () => {
    const selectedDate = startDate && endDate;
    const selectedFilter = community || agency || ageGroup;

    if (!selectedDate && !selectedFilter) {
      setValidationError("Please select atleast one filter to find.");
      return;
    }

    // Sends selected values to next page
    const filterParams = new URLSearchParams();
    if (community) filterParams.set("community", community);
    if (agency) filterParams.set("agency", agency);
    if (ageGroup) filterParams.set("ageGroup", ageGroup);

    // Change this path to desired path **
    router.push(`/report/first-nation/filtered?${filterParams.toString()}`);

    setValidationError("");
  };
  // It handles opening the report preview modal
  const handleOpenPreview = () => setShowPreview(true);

  // Handles closing the report preview modal
  const handleClosePreview = () => setShowPreview(false);

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Client&apos;s Report
          </h1>

          {/* Filters and actions */}
          <div className="space-y-6 bg-white shadow-md rounded-2xl p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <FirstNationFilters
                type="Community"
                array={DataColumn("First Nations", "firstNationMembership")}
                value={community}
                onChange={setCommunity}
                required
              />
              <FirstNationFilters
                type="Agency"
                array={DataColumn("CFS Agencies", "agencyName")}
                value={agency}
                onChange={setAgency}
                required
              />
              <FirstNationFilters
                type="Age Group"
                array={["0-18", "19-35", "36-60", "60+"]}
                value={ageGroup}
                onChange={setAgeGroup}
                required
              />
            </div>

            {/* Imported Date range filter component */}
            <DateFilterPage
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />

            {validationError && (
              <div className="text-red-500 text-center">{validationError}</div>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-6 w-full max-w-sm mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Find
                </h2>

                <button
                  type="button"
                  onClick={handleFind} // this will validate and open the preview
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  Find
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Download All
                </h2>

                <button
                  type="button"
                  onClick={handleOpenPreview}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
                >
                  Download All
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Report Preview Modal */}
      {showPreview && (
        <ReportPreview onClose={handleClosePreview} childrenDownloadButton={undefined}>
          <h2>Download All - First Nations</h2>
        </ReportPreview>
      )}
    </UserHome>
  );
}
