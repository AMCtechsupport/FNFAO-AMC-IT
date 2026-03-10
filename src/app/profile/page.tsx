// src/app/profile/page.js
import LinkAdvocate from "../../../components/link-advocate";
import DeleteAdvocate from "../../../components/delete-advocate";
import ManageUserRoles from "../../../components/manage-user-roles";
import UserHome from "../user-home/page";

const ProfilePage = () => {
  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advocate Management</h1>
            <p className="text-sm text-gray-500 mt-1">Create new advocates and manage existing ones</p>
          </div>

          <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-purple-500 text-white p-4">
              <h2 className="text-xl font-semibold">Manage Roles</h2>
              <p className="text-purple-100 text-sm">
                Change roles for existing users directly in the app
              </p>
            </div>
            <div className="p-6">
              <ManageUserRoles />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LinkAdvocate />
          <DeleteAdvocate />
        </div>

      </main>
    </UserHome>
  );
};

export default ProfilePage;
