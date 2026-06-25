/** BOOLEAN columns on Clients that use yes/no radios or checkboxes. */
export const CLIENT_BOOLEAN_FIELDS = [
  "onReserve",
  "transitionFromReserve",
  "previousFNFAOClient",
  "casePlanCopy",
  "prenatalSupport",
  "housingSupport",
  "addictionsSupport",
  "youthSupport",
  "custodySupport",
  "criminalCharges",
  "activeWarrant",
  "activeInvestigation",
  "activeOrders",
  "currentLawyer",
  "legalAssistance",
  "residentialSchool",
  "cfsCare",
  "adoptedScoop",
  "experiencedSuicide",
  "MMIWG2S",
  "familyViolence",
  "FASD",
  "ADHD",
  "PTSD",
  "depression",
  "cancerAutoimmuneCondition",
  "otherMentalCondition",
  "negativeCopingSkills",
  "educationalGoals",
  "accessElder",
  "kinship",
  "prentativeSupport",
  "privateAgreement",
  "previousInvolvement",
  "parentalCapacityDone",
  "cfsExplain",
  "turnToKinshipCare",
];

/** TEXT columns on Clients that store yes/no as strings, not booleans. */
export const CLIENT_TEXT_RADIO_FIELDS = ["otherAdultsInvolved"];

/**
 * Normalize raw form values for inserting into the Clients table.
 */
export function sanitizeClientInsertData(raw) {
  const out = {};

  for (const [key, value] of Object.entries(raw)) {
    if (CLIENT_TEXT_RADIO_FIELDS.includes(key)) {
      out[key] =
        value === "" || value === undefined || value === null ? null : String(value);
      continue;
    }

    if (CLIENT_BOOLEAN_FIELDS.includes(key)) {
      if (value === "yes" || value === true) out[key] = true;
      else if (value === "no" || value === false) out[key] = false;
      else if (value === "" || value === null || value === undefined) out[key] = null;
      else out[key] = value;
      continue;
    }

    if (value === "") {
      out[key] = null;
    } else if (value !== undefined) {
      out[key] = value;
    }
  }

  return out;
}

/**
 * Normalize a child row before inserting into Childs.
 */
export function sanitizeChildForInsert(child) {
  const sanitized = { ...child };

  for (const key of Object.keys(sanitized)) {
    if (sanitized[key] === "") sanitized[key] = null;
  }

  if (sanitized.childMedicalNeeds === "yes") {
    sanitized.childMedicalNeeds = true;
  } else if (sanitized.childMedicalNeeds === "no") {
    sanitized.childMedicalNeeds = false;
  } else if (sanitized.childMedicalNeeds == null) {
    sanitized.childMedicalNeeds = null;
  }

  return sanitized;
}
