"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

export default function SignOutButton({
  className,
  label = "Sign Out",
}: SignOutButtonProps) {
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  };

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      {label}
    </button>
  );
}
