import { redirect } from "next/navigation";
import { checkRole } from "../../../utils/roles";
import { SearchUsers } from "./search-users";
import { clerkClient } from "@clerk/nextjs/server";
import { removeRole, setRole } from "./_actions";

import UserHome from "../user-home/page";

export default async function AdminDashboard(params: {
  searchParams: Promise<{ search?: string }>;
}) {
  if (!checkRole("admin")) {
    redirect("/");
  }

  const query = (await params.searchParams).search;
  const client = await clerkClient();
  const users = query
    ? (await client.users.getUserList({ query })).data
    : (await client.users.getUserList()).data;

  return (
    <UserHome>
      <div className="max-w-3xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

        <div className="mb-6">
          <SearchUsers />
        </div>

        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white border border-gray-300 rounded-lg p-4 mb-4"
          >
            <h2 className="text-xl font-semibold">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-700">
              Email:{" "}
              {
                user.emailAddresses.find(
                  (email) => email.id === user.primaryEmailAddressId
                )?.emailAddress
              }
            </p>
            <p className="text-gray-700">
              Role: {user.publicMetadata.role as string}
            </p>

            <div className="mt-4 space-x-2">
              <form action={setRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="admin" name="role" />
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Make Admin
                </button>
              </form>

              <form action={setRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="operational manager" name="role" />
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Make Operational Manager
                </button>
              </form>

              <form action={setRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="advocacy coordinator" name="role" />
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
                >
                  Make Advocacy Coordinator
                </button>
              </form>

              <form action={setRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="advocate" name="role" />
                <button
                  type="submit"
                  className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition"
                >
                  Make Advocate
                </button>
              </form>

              <form action={setRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <input type="hidden" value="youth worker" name="role" />
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition"
                >
                  Make Youth Worker
                </button>
              </form>

              <form action={removeRole} className="inline">
                <input type="hidden" value={user.id} name="id" />
                <button
                  type="submit"
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition"
                >
                  Remove Role
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </UserHome>
  );
}
