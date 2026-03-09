import FirstNationManagement from "../../../components/manage-nations";
import CFSAgenciesManagement from "../../../components/manage-cfsAgencies";
import CFSStatusManagement from "../../../components/manage-cfsStatus";
import UserHome from "../user-home/page";

const FirstNationManagementPage = () => {
  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500 mt-1">Manage dropdown options used across the application</p>
          </div>
        </div>
        <div className="flex space-x-8">
          <div className="flex-3">
            <FirstNationManagement />
          </div>

          <div className="flex-2">
            <CFSAgenciesManagement />
          </div>
          <div className="flex-3">
            <CFSStatusManagement />
          </div>
        </div>
      </main>
    </UserHome>
  );
};

export default FirstNationManagementPage;
