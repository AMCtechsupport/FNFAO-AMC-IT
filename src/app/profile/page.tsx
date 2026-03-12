// src/app/profile/page.js
import LinkAdvocate from "../../../components/link-advocate";
import DeleteAdvocate from "../../../components/delete-advocate";
import PendingAdvocates from "../../../components/pending-advocates";
import ManageUserRoles from "../../../components/manage-user-roles";
import UserHome from "../user-home/page";

const ProfilePage = () => {
  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Advocate Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create new advocates and manage existing ones</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <LinkAdvocate />
          <DeleteAdvocate />
        </div>

        {/* Pending Requests */}
        <div className="mb-6">
          <PendingAdvocates />
        </div>

        {/* Manage Roles */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#a954f7" }}>
            Manage Roles
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
