// src/app/profile/page.js
import LinkAdvocate from "../../../components/link-advocate";
import DeleteAdvocate from "../../../components/delete-advocate";
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
