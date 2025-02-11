import supabase from "../../lib/supabase";
import Link from "next/link";

export default async function ClientsPage() {
  let clients = [];

  try {
    const { data, error } = await supabase.from("Clients").select("*");

    if (error) {
      console.error("Error fetching data:", error.message);
    } else {
      console.log("Connection successful.");
      clients = data;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            List of Clients
          </h1>
          {clients.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {clients.map((client) => (
                <li
                  key={client.client_id}
                  className="py-4 flex justify-between items-center"
                >
                  <div className="text-left">
                    <ul className="text-sm font-medium text-gray-900">
                      <Link href={`clients/${client.client_id}`}>
                        {client.firstName} {client.lastName}
                      </Link>
                    </ul>
                    <p className="text-sm text-gray-500">
                      Client ID: {client.client_id}
                    </p>
                    <p className="text-sm text-gray-500">
                      {client.phoneNumber}
                    </p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.address}</p>
                    <p className="text-sm text-gray-500">
                      {client.city}, {client.province}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(client.dateOfBirth).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No clients found.</p>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2025 My Next.js App</p>
      </footer>
    </div>
  );
}
