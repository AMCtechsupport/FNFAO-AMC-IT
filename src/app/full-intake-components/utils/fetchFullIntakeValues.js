import { getFormInitialValues } from "./InitialValues";

function fullIntakeInitialValues ({
    originalData,
    childrenData,
    notesData,
    caseNotes,
    legalNotes,
    familyData,
    EIAData,
    homeMembersData,
    }) {
        const formInitialValues = getFormInitialValues({
            originalData,
            childrenData,
            notesData,
            caseNotes,
            legalNotes,
            familyData,
            EIAData,
            homeMembersData,
    });
        
    console.log("📊 FORM INITIAL VALUES (after conversion):");
    console.log(JSON.stringify(formInitialValues, null, 2));
    
    console.log("🔍 RADIO BUTTON FIELD COMPARISON:");
    console.log("Field Name | Database Value | Form Value");
    console.log("----------------------------------------");

    // Radio button fields comparison
    const radioFields = [
        'onReserve', 'transitionFromReserve', 'previousFNFAOClient', 'casePlanCopy',
        'prenatalSupport', 'housingSupport', 'addictionsSupport', 'youthSupport',
        'custodySupport', 'criminalCharges', 'activeWarrant',
        'activeInvestigation', 'activeOrders', 'currentLawyer', 'legalAssistance',
        'residentialSchool', 'negativeCopingSkills', 'educationalGoals', 'accessElder',
        'kinship', 'prentativeSupport', 'privateAgreement', 'previousInvolvement',
        'parentalCapacityDone', 'cfsExplain', 'turnToKinshipCare'
    ];

    radioFields.forEach(field => {
        const dbValue = originalData?.[field];
        const formValue = formInitialValues[field];
        console.log(`${field} | ${dbValue} | ${formValue}`);
    });
    
    console.log("\n🔍 TEXT FIELD COMPARISON:");
    console.log("Field Name | Database Value | Form Value");
    console.log("----------------------------------------");

    // Text field comparison
    const textFields = [
        'firstName', 'middleName', 'lastName', 'dateOfBirth', 'phoneNumber',
        'address', 'city', 'province', 'postalCode', 'email', 'firstNationMembership',
        'treatyNumber', 'otherFirstNation', 'ninePersonalHealthNumber', 'sixPersonalHealthNumber',
        'martialStatus', 'sourceIncome', 'lawyerFullName', 'lawyerPhoneNumber', 'lawyerEmail'
    ];

    textFields.forEach(field => {
        const dbValue = originalData?.[field];
        const formValue = formInitialValues[field];
        console.log(`${field} | "${dbValue}" | "${formValue}"`);
    });

    return formInitialValues;
}

export default fullIntakeInitialValues;