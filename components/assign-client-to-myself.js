import { updateClientStatus } from "./client-active";
import { getAdvocateProfile } from "../src/app/lib/get-advocate-server";
import supabase from "../../lib/supabase";

/**
 * test
 * @param {} param0 
 */
async function assignAdvocateToMyself({ clientToAssign }) {
    let advocate = null;
    let advocateError = null;

    try {
    advocate = await getAdvocateProfile();
    } catch (err) {
    console.error("Error fetching advocate:", err.message);
    advocateError = err.message || "Could not load advocate profile";
    }

    const advocateId = advocate.advocate_id;

    const { error: autoassignError } = await supabase
      .from("Assigned Advocates")
      .insert([{ clientToAssign, advocateId }]);

    if (autoassignError) {
        throw autoassignError;
    }

    await updateClientStatus(clientToAssign);
}

export default assignAdvocateToMyself;