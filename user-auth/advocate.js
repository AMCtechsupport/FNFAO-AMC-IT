import { Protect } from "@clerk/nextjs";

export default function ProtectPage() {
  return (
    <Protect
      role="org:Member"
      fallback={
        <p>Only a member of the Billing department can access this content.</p>
      }
    >
      {children}
    </Protect>
  );
}
