import FirstNationManagement from "../../../components/manage-nations";
import CFSAgenciesManagement from "../../../components/manage-cfsAgencies";
import CFSStatusManagement from "../../../components/manage-cfsStatus";
import UserHome from "../user-home/page";

const FirstNationManagementPage = () => {
  return (
    <UserHome>
      <div className="min-h-screen bg-gray-50 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage dropdown options used across the application</p>
        </div>
        <div className="flex space-x-8 max-w-7xl mx-auto">
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
      </div>
    </UserHome>
  );
};

export default FirstNationManagementPage;
