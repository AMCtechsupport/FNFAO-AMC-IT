"use client";
import { useState, useEffect } from "react";
import UserHome from "../../user-home/page";
import { useAuth } from "@clerk/nextjs";
import supabase from "../../lib/supabase";

import { useParams, useRouter } from "next/navigation";
import FullIntakeForm from "../../full-intake-components/fullIntakeForm";

export default function AdultClientEdit({}) {
  const params = useParams();
  const router = useRouter();
  const client_id = params?.clientId || "61";

  const [clientName, setClientName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { userId, getToken } = useAuth();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/user-dashboard");
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
            <p className="text-sm text-gray-500 mt-1">Adult client — editing record</p>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors text-white"
            style={{ backgroundColor: "#6b7280" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4b5563")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#6b7280")}
          >
            ← Close
          </button>
        </div>

        {/* Edit mode notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-sm text-amber-800">
          <strong>Edit Mode:</strong> You are editing an existing adult client record.
        </div>

        <FullIntakeForm
          client_id={client_id}
          userId={userId}
          isEditMode={true}
          getToken={getToken}
        />

      </main>
    </UserHome>
  );
}
