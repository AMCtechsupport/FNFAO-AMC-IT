"use client";

import UserHome from "../../user-home/page";
import FirstNationPage from "../../../../components/report/first-nation-page";
import FirstNationFilters from "../../../../components/report/first-nation-filters";
import DateFilterPage from "../../../../components/report/date-range-filter";

export default function FirstNationsReportPage() {
  return (
    <UserHome>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            First Nations Report
          </h1>

          {/* drop down filters */}
          <div className="space-y-6 bg-white shadow-md rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
              <FirstNationFilters 
                type="Community" 
                array={["Community 1", "Community 2"]} />
              <FirstNationFilters 
                type="Agency" 
                array={["Agency 1", "Agency 2"]} />
              <FirstNationFilters 
                type="Age Group" 
                array={["0-18", "19-35", "36-60", "60+"]} />
            </div>

            {/*Date range */}
             <DateFilterPage />
            {/* Buttons */}
            <div className="flex flex-col gap-3 mt-6 w-full max-w-sm mx-auto">
              <FirstNationPage
                name="Find"
                path="*"
              />
              <FirstNationPage
                name="Download All"
                path="*"
              />
            </div>
          </div>
        </div>
      </div>
    </UserHome>
  );
}
