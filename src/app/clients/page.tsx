import supabase from "../../lib/supabase";
import Link from "next/link";

export default async function ClientsPage() {
  let clients = [];

  try {
    // Fetch data from all three tables
    const { data: preIntakeData, error: preIntakeError } = await supabase
      .from("Pre Intake")
      .select("*");

    const { data: fullIntakeData, error: fullIntakeError } = await supabase
      .from("Full Intake")
      .select("*");

    const { data: youthIntakeData, error: youthIntakeError } = await supabase
      .from("Youth Intake")
      .select("*");

    // Check for errors in any of the queries
    if (preIntakeError) {
      console.error("Error fetching Pre Intake data:", preIntakeError.message);
    }
    if (fullIntakeError) {
      console.error(
        "Error fetching Full Intake data:",
        fullIntakeError.message
      );
    }
    if (youthIntakeError) {
      console.error(
        "Error fetching Youth Intake data:",
        youthIntakeError.message
      );
    }

    // Combine all the data into one array, with an added intake phase field
    if (!preIntakeError) {
      preIntakeData.forEach((client) => (client.intakePhase = "Pre Intake"));
      clients = [...clients, ...preIntakeData];
    }
    if (!fullIntakeError) {
      fullIntakeData.forEach((client) => (client.intakePhase = "Full Intake"));
      clients = [...clients, ...fullIntakeData];
    }
    if (!youthIntakeError) {
      youthIntakeData.forEach(
        (client) => (client.intakePhase = "Youth Intake")
      );
      clients = [...clients, ...youthIntakeData];
    }

    // console.log("Fetched clients:", clients); // Verify the data
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
                  key={
                    client.pre_intake_id ||
                    client.full_intake_id ||
                    client.youth_intake_id
                  }
                  className="py-4 flex justify-between items-center"
                >
                  <div className="text-left">
                    <ul className="text-sm font-medium text-gray-900">
                      <Link
                        href={`clients/${
                          client.pre_intake_id ||
                          client.full_intake_id ||
                          client.youth_intake_id
                        }`}
                      >
                        {client.intakePhase === "Full Intake" &&
                        client.firstName &&
                        client.lastName
                          ? `${client.firstName} ${client.lastName}`
                          : client.intakePhase === "Pre Intake" &&
                            client.firstName &&
                            client.lastName
                          ? `${client.firstName} ${client.lastName}`
                          : client.intakePhase === "Youth Intake" &&
                            client.firstName &&
                            client.lastName
                          ? `${client.firstName} ${client.lastName}`
                          : "Name not available"}
                      </Link>
                    </ul>
                    <p className="text-sm text-gray-500">
                      Client ID:{" "}
                      {client.pre_intake_id ||
                        client.full_intake_id ||
                        client.youth_intake_id}
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
                      {client.dateOfBirth
                        ? new Date(client.dateOfBirth).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Date not available"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Intake Phase: {client.intakePhase}
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
