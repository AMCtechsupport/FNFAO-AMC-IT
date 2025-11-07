"use client";

import { useEffect, useState } from "react";
import supabase from "../../src/app/lib/supabase";

export default function useAdvocateData(advocateId) {
  const [advocateName, setAdvocateName] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!advocateId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // fetch advocate details
        const { data: advocateData, error: advocateError } = await supabase
          .from("Advocates")
          .select("firstName, lastName")
          .eq("advocate_id", Number(advocateId))
          .single();

        if (advocateError) throw advocateError;
        setAdvocateName(`${advocateData.firstName} ${advocateData.lastName}`);

        // fetch client IDs assigned to this advocate
        const { data: assignedData, error: assignedError } = await supabase
          .from("Assigned Advocates")
          .select("client_id")
          .eq("advocate_id", Number(advocateId));

        if (assignedError) throw assignedError;
        if (!assignedData || assignedData.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }

        // extract all client IDs
        const clientIds = assignedData.map((item) => item.client_id);

        //fetch client details
        const { data: clientsData, error: clientsError } = await supabase
          .from("Clients")
          .select(`client_id,
                  firstName,
                  lastName,
                  dateOfBirth,
                  cfsAgency,
                  firstNationMembership,
                  clientStatus,
                  createdAt`)
          .in("client_id", clientIds);

        if (clientsError) throw clientsError;

        //count children for each client
        const clientsWithChildCount = await Promise.all(
          clientsData.map(async (client) => {
            const { count, error: childError } = await supabase
              .from("Childs")
              .select("*", { count: "exact", head: true })
              .eq("client_id", client.client_id);

            if (childError) throw childError;

            return {
              ...client,
              childCount: count || 0,
            };
          })
        );

        setClients(clientsWithChildCount);
      } catch (err) {
        console.error("Error fetching advocate data:", err);
        setError("Failed to load advocate data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [advocateId]);

  return { advocateName, clients, loading, error };
}
