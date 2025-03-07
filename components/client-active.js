// clientUtils.js
import supabase from "../src/app/lib/supabase";

export const updateClientStatus = async (clientId) => {
  try {
    const { error } = await supabase
      .from("Clients")
      .update({ clientStatus: "Active" })
      .eq("client_id", clientId);

    if (error) {
      console.error("Error updating client status:", error.message);
    }
  } catch (err) {
    console.error("Unexpected error while updating client status:", err);
  }
};
