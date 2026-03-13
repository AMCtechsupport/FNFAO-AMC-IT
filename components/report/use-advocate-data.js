/*
This component fetches advocate data via a server action,
including advocate details, assigned clients, and child counts.
*/

"use client";

import { useEffect, useState } from "react";
import { getAdvocateClientData } from "../../src/app/lib/get-advocate-client-data";

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

      const result = await getAdvocateClientData(Number(advocateId));

      if (result.error) {
        setError("Failed to load advocate data.");
      } else {
        setAdvocateName(result.advocateName);
        setClients(result.clients);
      }

      setLoading(false);
    };

    fetchData();
  }, [advocateId]);

  return { advocateName, clients, loading, error };
}
