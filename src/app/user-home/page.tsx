export default function UserHome() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">User Dashboard</h1>
          <div className="space-x-4"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white p-4 border-r">
          <nav className="space-y-4">
            <a
              href="#"
              className="block text-gray-700 hover:bg-blue-100 p-2 rounded"
            >
              Dashboard
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:bg-blue-100 p-2 rounded"
            >
              Profile
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:bg-blue-100 p-2 rounded"
            >
              Settings
            </a>
            <a
              href="#"
              className="block text-gray-700 hover:bg-blue-100 p-2 rounded"
            >
              Messages
            </a>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome back, User!
            </h2>
            <p className="mt-4 text-gray-600">
              Here's your recent activity and updates:
            </p>
            <div className="mt-6">
              <p className="text-gray-700">You have 3 unread messages.</p>
              <p className="mt-2 text-gray-700">
                Your profile is 90% complete.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
