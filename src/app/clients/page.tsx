import supabase from "../lib/supabase";
import UserHome from "../user-home/page";
import ClientsList from "../../../components/client-list";

export default async function ClientsPage() {
  // Fetch the initial data
  const { data, count } = await fetchClientsData(1);

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">
        <ClientsList initialClients={data} totalCount={count} />
      </main>
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
