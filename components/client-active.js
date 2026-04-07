// clientUtils.js
import supabase from "../src/app/lib/supabase";

export const updateClientStatus = async (clientId, status) => {
  try {
    const { error } = await supabase
      .from("Clients")
      .update({ clientStatus: status })
      .eq("client_id", clientId);

    if (error) {
      console.error("Error updating client status:", error.message);
    }
  } catch (err) {
    console.error("Unexpected error while updating client status:", err);
  }
};
