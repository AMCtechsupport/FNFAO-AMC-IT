import { updateClientStatus } from "./client-active";
import supabase from "@/app/lib/supabase";

/**
 * This function accepts the ID of the client and advocate, and assigns the client
 * to the advocate upon the calling of this function. It also updates the client's status
 * to "Active".
 * 
 * @param {number} clientToAssign The ID of the client to assign to the advocate.
 * @param {number} advocateId The ID of the advocate to assign for the client.
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