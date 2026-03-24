import { updateClientStatus } from "./client-active";
import { getAdvocateProfile } from "../src/app/lib/get-advocate-server";
import supabase from "@/app/lib/supabase";

/**
 * test
 * @param {} param0 
 */
export async function assignClientToMyself(clientToAssign) {
    let advocate = null;
    let advocateError = null;

    try {
    advocate = await getAdvocateProfile();
    } catch (err) {
    console.error("Error fetching advocate:", err.message);
    advocateError = err.message || "Could not load advocate profile";
    }

    const advocateId = advocate.advocate_id;
    console.log(`AdvocateId: ${advocateId}`);
    console.log(`client_id: ${clientToAssign}`);

    const { error: autoassignError } = await supabase
      .from("Assigned Advocates")
      .insert([{ client_id: clientToAssign, advocate_id: advocateId}]);

    if (autoassignError) {
        throw autoassignError;
    }
    
    updateClientStatus(clientToAssign);
}