import supabase from "../lib/supabase";
import UserHome from "../user-home/page";
import ClientsList from "../../../components/client-list";

export default async function ClientsPage() {
  // Fetch the initial data
  const { data, count } = await fetchClientsData(1);

  return (
    <UserHome>
      <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
        <main className="flex-grow p-4">
          <div className="bg-white-200 rounded-lg shadow-lg w-full p-6">
            {/* Pass initial data and count to the client-side component */}
            <ClientsList initialClients={data} totalCount={count} />
          </div>
        </main>

        {/* Footer Component */}
        <footer className="bg-gray-800 text-white text-center p-4">
          <p>&copy; 2025 My Next.js App</p>
        </footer>
      </div>
    </UserHome>
  );
}

// Fetch clients data (could be from an API or direct DB query)
async function fetchClientsData(page: number) {
  try {
    const { data, error, count } = await supabase
      .from("Clients")
      .select("*", { count: "exact" })
      .range((page - 1) * 10, page * 10 - 1)
      .order("dateModified", { ascending: false });

    if (error) {
      console.error("Error fetching data:", error.message);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: count || 0 };
  } catch (err: unknown) {
    console.error("Error fetching data:", err instanceof Error ? err.message : String(err));
    return { data: [], count: 0 };
  }
}
