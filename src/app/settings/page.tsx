import FirstNationManagement from "../../../components/manage-nations";
import CFSAgenciesManagement from "../../../components/manage-cfsAgencies";
import CFSStatusManagement from "../../../components/manage-cfsStatus";
import UserHome from "../user-home/page";

const FirstNationManagementPage = () => {
  return (
    <UserHome>
      <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-8">
        <div className="flex space-x-8 max-w-4xl mx-auto">
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
