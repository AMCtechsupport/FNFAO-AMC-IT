"use client";

import { useEffect, useState } from "react";
import LinkAdvocate from "../../../components/link-advocate";
import DeleteAdvocate from "../../../components/delete-advocate";
import PendingAdvocates from "../../../components/pending-advocates";
import ManageUserRoles from "../../../components/manage-user-roles";
import ChangePassword from "../../../components/change-password";
import UserHome from "../user-home/page";

const ProfilePage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [ssoConfigured, setSsoConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/auth/sso-status")
      .then((res) => res.json())
      .then((data) => setSsoConfigured(Boolean(data.ssoConfigured)))
      .catch(() => setSsoConfigured(false));
  }, []);

  const handleAdvocateCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create new users and manage existing ones</p>
        </div>

        {!ssoConfigured && (
          <div className="mb-6 max-w-lg">
            <ChangePassword />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LinkAdvocate onAdvocateCreated={handleAdvocateCreated} />
          <DeleteAdvocate />
        </div>

        {/* Pending Requests */}
        <div className="mb-6">
          <PendingAdvocates refreshTrigger={refreshTrigger} />
        </div>

        {/* Manage Roles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "rgba(97, 0, 215, 0.8)" }}>
            Manage User Roles
          </div>
          <div className="p-6">
            <ManageUserRoles />
          </div>
        </div>

      </main>
    </UserHome>
  );
};

export default ProfilePage;
