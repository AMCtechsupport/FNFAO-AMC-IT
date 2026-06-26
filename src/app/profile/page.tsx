"use client";

import { useState } from "react";
import LinkAdvocate from "../../../components/link-advocate";
import DeleteAdvocate from "../../../components/delete-advocate";
import PendingAdvocates from "../../../components/pending-advocates";
import ManageUserRoles from "../../../components/manage-user-roles";
import UserHome from "../user-home/page";

const TABS = [
  { id: "create", label: "Create New User" },
  { id: "delete", label: "Delete User" },
  { id: "roles", label: "Manage Roles" },
  { id: "list", label: "List All Users" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<TabId>("create");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAdvocateCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create new users and manage existing ones
          </p>
        </div>

        <div
          className="mb-6 flex flex-wrap gap-1 border-b border-gray-200"
          role="tablist"
          aria-label="User management sections"
        >
          {TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                  selected
                    ? "border-[#6100d7] text-[#6100d7]"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div role="tabpanel">
          {activeTab === "create" && (
            <LinkAdvocate onAdvocateCreated={handleAdvocateCreated} />
          )}
          {activeTab === "delete" && <DeleteAdvocate />}
          {activeTab === "roles" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div
                className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}
              >
                Manage Roles
              </div>
              <div className="p-6">
                <ManageUserRoles />
              </div>
            </div>
          )}
          {activeTab === "list" && (
            <PendingAdvocates refreshTrigger={refreshTrigger} />
          )}
        </div>
      </main>
    </UserHome>
  );
};

export default ProfilePage;
