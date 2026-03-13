"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdultClientRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/adult-clients/${params.clientId}/edit`);
  }, [params.clientId, router]);

  return null;
}
