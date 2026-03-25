import { updateClientStatus } from "./client-active";
import supabase from "@/app/lib/supabase";

/**
 * test
 * @param {} param0 
 */
export async function assignClientToAdvocate(clientToAssign, advocateId) {

    const { error: autoassignError } = await supabase
      .from("Assigned Advocates")
      .insert([{ client_id: clientToAssign, advocate_id: advocateId}]);

    if (autoassignError) {
        throw autoassignError;
    }
    
    updateClientStatus(clientToAssign, "Active");
}