import {createClient} from "@supabase/supabase-js";

const supabase = createClient(process.env.PUBLIC_SUPABASE_URL,
                              process.env.PUBLIC_SUPABASE_ANON_KEY);

// Create a pre-intake
export async function insertPreIntake(formData){
    const {firstName, middleName, lastName, dateOfBirth, address,
        city, postalCode, province, phoneNumber, email, emergencyContactName,
        emergencyContactNumber, relationshipToChildren, otherAdultsInvolved,
        otherAdultsInvolvedExplained, firstNationMembership, treatyNumber,
        otherFirstnation, ninePersonalHealthNumber, sixPersonalHealthNumber, onReserve,
        transitionFromReserve, previousFNFAOClient, seekingAdvocacy, childFullName,
        childDateOfBirth, childNation, childPlaced, cfsAgency,
        cfsAgentFullName, cfsAgentNumber, cfsAgentEmail, statusCFSFile,
        visitsChild, vistsChildFrequency, casePlanCopy, casePlanCopyDescribe,
        involvedCFSReason, prenatalSupport, prenatalSupportSpecified, housingSupport,
        housingSupportSpecified, addictionsSupport, addictionsSupportSpecified, youthSupport,
        youthSupportSpecified, currentLawyer, legalAssistance, legalAssistanceSpecified,
        custodySupport, custodySupportSpecified, criminalCharges, criminalChargesSpecified,
        activeWarrant, activeWarrantSpecified, activeInvestigation, activeInvestigationExplained,
        activeOrders, activeOrdersExplained, unableToAssistExplained, referForSupport,
        completedBy, assignedStaff
    } = Object.fromEntries(formData);

    const {data, error} = await supabase
    .from ("Clients")
    .insert([{firstName, middleName, lastName, dateOfBirth, address,
        city, postalCode, province, phoneNumber, email, emergencyContactName,
        emergencyContactNumber, relationshipToChildren, otherAdultsInvolved,
        otherAdultsInvolvedExplained, firstNationMembership, treatyNumber,
        otherFirstnation, ninePersonalHealthNumber, sixPersonalHealthNumber, onReserve,
        transitionFromReserve, previousFNFAOClient, seekingAdvocacy, childFullName,
        childDateOfBirth, childNation, childPlaced, cfsAgency,
        cfsAgentFullName, cfsAgentNumber, cfsAgentEmail, statusCFSFile,
        visitsChild, vistsChildFrequency, casePlanCopy, casePlanCopyDescribe,
        involvedCFSReason, prenatalSupport, prenatalSupportSpecified, housingSupport,
        housingSupportSpecified, addictionsSupport, addictionsSupportSpecified, youthSupport,
        youthSupportSpecified, currentLawyer, legalAssistance, legalAssistanceSpecified,
        custodySupport, custodySupportSpecified, criminalCharges, criminalChargesSpecified,
        activeWarrant, activeWarrantSpecified, activeInvestigation, activeInvestigationExplained,
        activeOrders, activeOrdersExplained, unableToAssistExplained, referForSupport,
        completedBy, assignedStaff}]);

        if (error) {
            console.error("Error inserting data:", error.message);
            return { error: error.message };
        }


    return data;
}




