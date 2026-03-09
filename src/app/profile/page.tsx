// src/app/profile/page.js
import LinkAdvocate from "../../../components/link-advocate";
import DeleteAdvocate from "../../../components/delete-advocate";
import ManageUserRoles from "../../../components/manage-user-roles";
import UserHome from "../user-home/page";

const ProfilePage = () => {
  return (
    <UserHome>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Advocate Management
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create Advocate Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-semibold">Create New Advocate</h2>
                <p className="text-blue-100 text-sm">Add a new advocate to the system</p>
              </div>
              <div className="p-6">
                <LinkAdvocate />
              </div>
            </div>

            {/* Delete Advocate Section */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-red-600 text-white p-4">
                <h2 className="text-xl font-semibold">Delete Advocate</h2>
                <p className="text-red-100 text-sm">Remove an advocate from the system</p>
              </div>
              <div className="p-6">
                <DeleteAdvocate />
              </div>
            </div>
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
      </div>
    </UserHome>
  );
};

export default ProfilePage;
