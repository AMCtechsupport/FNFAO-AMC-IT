-- AMC-FNFAO PostgreSQL schema (DigitalOcean / self-hosted)

CREATE TABLE IF NOT EXISTS "Advocates" (
  advocate_id SERIAL PRIMARY KEY,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'advocate' CHECK (role IN ('admin', 'advocate')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "First Nations" (
  nation_id SERIAL PRIMARY KEY,
  "firstNationMembership" TEXT NOT NULL UNIQUE,
  "bandNumber" INTEGER,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  "bandOfficePhone" TEXT,
  "chiefName" TEXT
);

CREATE TABLE IF NOT EXISTS "CFS Agencies" (
  agency_id SERIAL PRIMARY KEY,
  "agencyName" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "CFS Status" (
  id SERIAL PRIMARY KEY,
  "cfsStatus" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "Clients" (
  client_id SERIAL PRIMARY KEY,
  "firstName" TEXT,
  "middleName" TEXT,
  "lastName" TEXT,
  "dateOfBirth" TEXT,
  "phoneNumber" TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  "postalCode" TEXT,
  "clientType" TEXT,
  "clientStatus" TEXT DEFAULT 'Inactive',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "dateModified" TIMESTAMPTZ DEFAULT NOW(),
  "createdBy" TEXT,
  "modifiedBy" TEXT,
  "firstNationMembership" TEXT,
  "treatyNumber" TEXT,
  "otherFirstNation" TEXT,
  "otherFirstnation" TEXT,
  "onReserve" BOOLEAN,
  "transitionFromReserve" BOOLEAN,
  "previousFNFAOClient" BOOLEAN,
  "seekingAdvocacy" BOOLEAN,
  "cfsAgency" TEXT,
  "statusCFSFile" TEXT,
  "cfsAgentFullName" TEXT,
  "cfsAgentNumber" TEXT,
  "cfsAgentEmail" TEXT,
  "relationshipToChildren" TEXT,
  "otherAdultsInvolved" TEXT,
  "otherAdultsInvolvedExplained" TEXT,
  "casePlanCopy" BOOLEAN,
  "casePlanCopyDescribe" TEXT,
  "involvedCFSReason" TEXT,
  "visitsChild" BOOLEAN,
  "vistsChildFrequency" TEXT,
  "visitsChildFrequency" TEXT,
  "prenatalSupport" BOOLEAN,
  "prenatalSupportSpecified" TEXT,
  "housingSupport" BOOLEAN,
  "housingSupportSpecified" TEXT,
  "addictionsSupport" BOOLEAN,
  "addictionsSupportSpecified" TEXT,
  "youthSupport" BOOLEAN,
  "youthSupportSpecified" TEXT,
  "legalAssistance" BOOLEAN,
  "legalAssistanceSpecified" TEXT,
  "custodySupport" BOOLEAN,
  "custodySupportSpecified" TEXT,
  "criminalCharges" BOOLEAN,
  "criminalChargesSpecified" TEXT,
  "activeWarrant" BOOLEAN,
  "activeWarrantSpecified" TEXT,
  "activeInvestigation" BOOLEAN,
  "activeInvestigationExplained" TEXT,
  "activeOrders" BOOLEAN,
  "activeOrdersExplained" TEXT,
  "unableToAssistExplained" TEXT,
  "referForSupport" TEXT,
  "completedBy" TEXT,
  "assignedStaff" TEXT,
  "emergencyContactName" TEXT,
  "emergencyContactNumber" TEXT,
  "ninePersonalHealthNumber" TEXT,
  "sixPersonalHealthNumber" TEXT,
  "childFullName" TEXT,
  "childDateOfBirth" TEXT,
  "childNation" TEXT,
  "childPlaced" TEXT,
  "currentLawyer" BOOLEAN,
  "lawyerFullName" TEXT,
  "lawyerPhoneNumber" TEXT,
  "lawyerEmail" TEXT,
  "residentialSchool" BOOLEAN,
  "cfsCare" BOOLEAN,
  "adoptedScoop" BOOLEAN,
  "experiencedSuicide" BOOLEAN,
  "MMIWG2S" BOOLEAN,
  "familyViolence" BOOLEAN,
  "FASD" BOOLEAN,
  "ADHD" BOOLEAN,
  "PTSD" BOOLEAN,
  depression BOOLEAN,
  "cancerAutoimmuneCondition" BOOLEAN,
  "otherMentalCondition" BOOLEAN,
  "otherMentalConditionExplained" TEXT,
  "negativeCopingSkills" BOOLEAN,
  "negativeCopingSkillsExplain" TEXT,
  "drugsImpact" TEXT,
  "lastTimeUsed" TEXT,
  "educationalGoals" BOOLEAN,
  "educationalGoalsExplained" TEXT,
  "accessElder" BOOLEAN,
  "accessElderExplained" TEXT,
  kinship BOOLEAN,
  "kinshipExplained" TEXT,
  "cfsChildrenApprehesionReason" TEXT,
  "connectedCommunity" TEXT,
  "inSchool" TEXT,
  "fullStudent" TEXT,
  "bankAccount" TEXT,
  "incomeAssistance" TEXT,
  "youthJustice" TEXT,
  pronouns TEXT,
  "socialMedia" TEXT,
  "inCare" TEXT,
  "apprehendedOnReserve" TEXT,
  "currentlyStaying" TEXT,
  "currentlyStayingDuration" TEXT,
  "peopleHome" INTEGER,
  "schoolAttending" TEXT,
  "currentGrade" TEXT,
  "schoolSchedule" TEXT,
  "birthCertificate" BOOLEAN,
  "driversLicense" BOOLEAN,
  "healthCard" BOOLEAN,
  "statusCard" BOOLEAN,
  "enhancedID" BOOLEAN,
  "studentID" BOOLEAN,
  "caseWorkerFullName" TEXT,
  "caseWorkerPhoneNumber" TEXT,
  "caseWorkerEmail" TEXT,
  disabilities TEXT,
  "disabilitiesExplained" TEXT,
  "careExperience" TEXT,
  "kindSupport" TEXT,
  "personalGoals" TEXT,
  "additionalInformation" TEXT,
  "motherFirstName" TEXT,
  "motherMiddleName" TEXT,
  "motherLastName" TEXT,
  "motherNation" TEXT,
  "fatherFirstName" TEXT,
  "fatherMiddleName" TEXT,
  "fatherLastName" TEXT,
  "fatherNation" TEXT,
  "referredBy" TEXT,
  "lastFaceToFace" TEXT,
  "previousInvolvement" BOOLEAN,
  "previousInvolvementExplain" TEXT,
  "selfHarm" TEXT,
  "childAbuse" TEXT,
  "criminalRecord" TEXT,
  "noContact" TEXT,
  "parentalCapacity" TEXT,
  "parentalCapacityDone" BOOLEAN,
  "martialStatus" TEXT,
  "childrenInCareDuration" TEXT,
  "anyConcerns" TEXT,
  "preventativeSupport" BOOLEAN,
  "preventativeSupportExplained" TEXT,
  "privateAgreement" BOOLEAN,
  "privateAgreementExplained" TEXT,
  "cfsExplain" BOOLEAN,
  "turnToKinshipCare" BOOLEAN,
  "sourceIncome" TEXT,
  "diagnosedFollowingExplain" TEXT,
  "speakingOffice" TEXT,
  "youthWorkshops" TEXT,
  "emergencyContactFirstName" TEXT,
  "emergencyContactLastName" TEXT
);

CREATE TABLE IF NOT EXISTS "Childs" (
  child_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  "firstName" TEXT,
  "middleName" TEXT,
  "lastName" TEXT,
  "birthDate" TEXT,
  gender TEXT,
  "isFamily" BOOLEAN,
  "isCFS" BOOLEAN,
  "fathersName" TEXT,
  "childNation" TEXT,
  "childPlaced" TEXT,
  "childCfsAgency" TEXT,
  "childStatusCfsFile" TEXT,
  "childMedicalNeeds" BOOLEAN,
  "childMedicalNeedsExplained" TEXT,
  "biologicalParentFirstName" TEXT,
  "biologicalParentLastName" TEXT,
  "biologicalParentFirstNation" TEXT,
  "childCfsAgentFullName" TEXT,
  "childCfsAgentNumber" TEXT,
  "childCfsAgentEmail" TEXT,
  "childCfsSupervisorFullName" TEXT,
  "childCfsSupervisorNumber" TEXT,
  "childCfsSupervisorEmail" TEXT
);

CREATE TABLE IF NOT EXISTS "Home Members" (
  home_members_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  "firstName" TEXT,
  "middleName" TEXT,
  "lastName" TEXT,
  relationship TEXT,
  "phoneNumber" TEXT,
  email TEXT,
  "livingTogether" TEXT
);

CREATE TABLE IF NOT EXISTS "Important Family and Friends" (
  family_and_friends_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  "firstName" TEXT,
  "middleName" TEXT,
  "lastName" TEXT,
  relationship TEXT,
  "phoneNumber" TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS "EIA Workers" (
  "EIA_worker_id" SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  "firstName" TEXT,
  "lastName" TEXT,
  "phoneNumber" TEXT,
  "EIACaseNumber" TEXT
);

CREATE TABLE IF NOT EXISTS "Educational Support Persons" (
  educational_support_person_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  "firstName" TEXT,
  "middleName" TEXT,
  "lastName" TEXT,
  relationship TEXT,
  "phoneNumber" TEXT,
  email TEXT
);

CREATE TABLE IF NOT EXISTS "Emergency Contacts" (
  emergency_contact_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  "firstName" TEXT,
  "lastName" TEXT,
  "phoneNumber" TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS "Files" (
  file_id SERIAL PRIMARY KEY,
  "fileName" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "uploadedAt" TIMESTAMPTZ DEFAULT NOW(),
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  owner_id TEXT
);

CREATE TABLE IF NOT EXISTS "Notes" (
  note_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  advocate_id INTEGER REFERENCES "Advocates"(advocate_id) ON DELETE SET NULL,
  modified_by_advocate_id INTEGER REFERENCES "Advocates"(advocate_id) ON DELETE SET NULL,
  file_id INTEGER REFERENCES "Files"(file_id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'general',
  "subType" TEXT,
  description TEXT,
  "actionPlan" TEXT,
  "noteType" TEXT DEFAULT 'Case',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "modifiedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Assigned Advocates" (
  assigned_advocate_id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE CASCADE,
  advocate_id INTEGER REFERENCES "Advocates"(advocate_id) ON DELETE CASCADE,
  "dateAssigned" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (client_id, advocate_id)
);

CREATE TABLE IF NOT EXISTS "User Logs" (
  log_id SERIAL PRIMARY KEY,
  description TEXT,
  "logType" TEXT,
  advocate_id INTEGER REFERENCES "Advocates"(advocate_id) ON DELETE SET NULL,
  client_id INTEGER REFERENCES "Clients"(client_id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_type ON "Clients"("clientType");
CREATE INDEX IF NOT EXISTS idx_clients_status ON "Clients"("clientStatus");
CREATE INDEX IF NOT EXISTS idx_notes_client ON "Notes"(client_id);
CREATE INDEX IF NOT EXISTS idx_assigned_advocate ON "Assigned Advocates"(advocate_id);
CREATE INDEX IF NOT EXISTS idx_assigned_client ON "Assigned Advocates"(client_id);
