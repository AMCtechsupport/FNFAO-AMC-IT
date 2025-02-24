import Link from "next/link";

export default function UserHome({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <img src="/logoFNFAO" alt="logo" />

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
            <Link
              href="/pre-intake"
              className="block text-gray-700 hover:bg-blue-100 p-2 rounded"
            >
              Pre-Intake
            </Link>
          </nav>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">
        {children}
        </main>
      </div>
    </div>
  );
}
