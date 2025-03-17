// src/app/first-nation-management.js (or pages/first-nation-management.js if you're using Pages Directory)
import FirstNationManagement from "../../../components/manage-nations";
import UserHome from "../user-home/page";
// Adjust the import path accordingly

const FirstNationManagementPage = () => {
  return (
    <UserHome>
      <div className="min-h-screen bg-gray-50 py-12 px-6 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <FirstNationManagement />
        </div>
      </div>
    </UserHome>
  );
};

export default FirstNationManagementPage;
