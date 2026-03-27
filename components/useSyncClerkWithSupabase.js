"use client";

import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import supabase from "../src/app/lib/supabase";

//  Connects Clerk and Supabase by sending the user token to Supabase when signed in

const useSyncClerkWithSupabase = () => {
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const syncSession = async () => {
      if (!isSignedIn) return;

      const token = await getToken({ template: "supabase" }); // Obtén el JWT de Clerk
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: "", // Leave the refresh_token empty because Clerk handles it
      });
    };

    syncSession();
  }, [isSignedIn]); // This effect is executed when the user logs in or logs out.
};

export default useSyncClerkWithSupabase;
