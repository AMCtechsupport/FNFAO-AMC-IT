// src/app/link-advocate/page.js
import LinkAdvocate from "../../../components/link-advocate";
import UserHome from "../user-home/page";

const LinkAdvocatePage = () => {
  return (
    <UserHome>
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
          <LinkAdvocate />
        </div>
      </div>
    </UserHome>
  );
};

export default LinkAdvocatePage;
