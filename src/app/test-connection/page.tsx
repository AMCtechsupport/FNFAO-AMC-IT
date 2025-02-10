import supabase from "../../lib/supabase";

export default async function Home() {
  let clients = [];

  try {
    // Fetch all clients from the "Clients" table
    const { data, error } = await supabase.from("Clients").select("*");

    if (error) {
      console.error("Error fetching data:", error.message);
    } else {
      console.log("Connection successful. Data:", data);
      clients = data;
    }
  } catch (err) {
    console.error("Unexpected error:", err);
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <main className="flex-grow flex items-center justify-center text-center p-8">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            List of Clients
          </h1>
          {clients.length > 0 ? (
            <ul className="list-disc list-inside text-left text-gray-700">
              {clients.map((client) => (
                <li key={client.client_id}>{client.firstName}</li>
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
