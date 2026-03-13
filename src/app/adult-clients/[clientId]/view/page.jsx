"use client";
import { useState, useEffect } from "react";
import UserHome from "../../../user-home/page";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import supabase from "../../../lib/supabase";

import FullIntakeForm from "../../../full-intake-components/fullIntakeForm";

export default function AdultClientView() {
  const params = useParams();
  const router = useRouter();
  const client_id = params?.clientId;

  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => {
    if (history.state && history.state.idx > 0) {
      router.back();
    } else {
      router.push("/clients");
    }
  };

  useEffect(() => {
    const fetchClientName = async () => {
      if (!client_id) return;

      try {
        setIsLoading(true);
        const { data: client, error } = await supabase
          .from("Clients")
          .select("firstName, lastName")
          .eq("client_id", client_id)
          .single();

        if (error) {
          console.error("Error fetching client name:", error);
          setClientName("Unknown Client");
        } else {
          setClientName(`${client.firstName} ${client.lastName}`);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setClientName("Unknown Client");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientName();
  }, [client_id]);

  return (
    <UserHome>
      <main className="min-h-screen bg-gray-100 p-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isLoading ? "Loading..." : clientName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Adult client — read-only view</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white"
              style={{ backgroundColor: "#6b7280" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
            >
              Close
            </button>
            <Link
              href={`/adult-clients/${client_id}/edit`}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white no-underline"
              style={{ backgroundColor: "#47315E" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#47315E")}
            >
              Edit
            </Link>
          </div>
        </div>

        {/* View-only notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6 text-sm text-blue-800">
          <strong>Read-Only:</strong> You are viewing an adult client record. Switch to Edit to make changes.
        </div>

        <FullIntakeForm
          client_id={client_id}
          isEditMode={false}
          isViewOnly={true}
        />

        {/* Bottom action bar */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white"
            style={{ backgroundColor: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
          >
            Close
          </button>
          <Link
            href={`/adult-clients/${client_id}/edit`}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white no-underline"
            style={{ backgroundColor: "#47315E" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(58, 38, 73, 0.8)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#47315E")}
          >
            Edit
          </Link>
        </div>

      </main>
    </UserHome>
  );
}
