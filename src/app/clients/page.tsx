// app/clients/page.js (Server Component)
import supabase from "../../../lib/supabase"; // Correct the import path here
import ClientsList from "../../../components/client-list"; // Client-side Component

export default async function ClientsPage() {
  // Server-side fetch to get initial data
  const { data, error, count } = await fetchClientsData(1); // Fetch first page (for SSR)

  if (error) {
    console.error("Error fetching data:", error.message);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            List of Clients
          </h1>

          {/* Pass the initial data and total count to the client-side component */}
          <ClientsList initialClients={data} totalCount={count} />
        </div>
      </main>

      <footer className="bg-gray-800 text-white text-center p-4">
        <p>&copy; 2025 My Next.js App</p>
      </footer>
    </div>
  );
}

// Function to fetch data (this could be an API call or direct DB query)
async function fetchClientsData(page) {
  try {
    const { data, error, count } = await supabase
      .from("Clients")
      .select("*", { count: "exact" })
      .range((page - 1) * 10, page * 10 - 1);

    if (error) throw error;

    return { data, count };
  } catch (err) {
    console.error("Error fetching data:", err);
    return { data: [], count: 0 };
  }
}
