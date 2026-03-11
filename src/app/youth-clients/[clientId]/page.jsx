"use client";
import { useParams, redirect } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function YouthClientRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/youth-clients/${params.clientId}/edit`);
  }, [params.clientId, router]);

  return null;
}
