"use client";

import { useRouter } from "next/navigation";

export default function ClientDetailsPage({ params }) {
  const router = useRouter();

  console.log(router.pathname);
  console.log(router.query);

  return (
    <>
      <header></header>

      <main>
        <p>Hello there!</p>
      </main>
    </>
  );
}
