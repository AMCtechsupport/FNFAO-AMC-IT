const preIntakeInitialValues = {
  // Client info (GeneralInformationHeader)
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  phoneNumber: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  email: "",
  referredBy: "",

  // General tab — Card 1: General Information
  firstNationMembership: "",
  treatyNumber: "",
  otherFirstNation: "",
  ninePersonalHealthNumber: "",
  sixPersonalHealthNumber: "",
  martialStatus: "",

  // General tab — Card 2: Reserve & Background
  onReserve: "",
  transitionFromReserve: "",
  previousFNFAOClient: "",
  prenatalSupport: "",
  prenatalSupportSpecified: "",
  housingSupport: "",
  housingSupportSpecified: "",
  addictionsSupport: "",
  addictionsSupportSpecified: "",

  // General tab — Card 3: Important Family Members and Friends
  homeMembers: [],

  // General tab — Card 4: Family Experiences
  residentialSchool: false,
  cfsCare: false,
  adoptedScoop: false,
  experiencedSuicide: false,
  MMIWG2S: false,
  familyViolence: false,

  // General tab — Card 5: Lawyer Information
  currentLawyer: "",
  lawyerFullName: "",
  lawyerPhoneNumber: "",
  lawyerEmail: "",
  legalAssistance: "",
  legalAssistanceSpecified: "",

  // General tab — Card 6: Financial & Legal
  sourceIncome: "",
  EIA: [],
  youthSupport: "",
  youthSupportSpecified: "",
  custodySupport: "",
  custodySupportSpecified: "",
  criminalCharges: "",
  criminalChargesSpecified: "",
  activeWarrant: "",
  activeWarrantSpecified: "",
  activeInvestigation: "",
  activeInvestigationExplained: "",
  activeOrders: "",
  activeOrdersExplained: "",

  // Children tab
  relationshipToChildren: "",
  otherAdultsInvolved: "",
  otherAdultsInvolvedExplained: "",
  children: [],

  // Health & Wellness tab
  FASD: false,
  ADHD: false,
  PTSD: false,
  depression: false,
  cancerAutoimmuneCondition: false,
  otherMentalCondition: false,
  otherMentalConditionExplained: "",
  diagnosedFollowingExplain: "",
  negativeCopingSkills: "",
  negativeCopingSkillsExplain: "",
  drugsImpact: "",
  lastTimeUsed: "",
  educationalGoals: "",
  educationalGoalsExplained: "",
  accessElder: "",
  accessElderExplained: "",

  // Child & Family Services tab
  childrenInCareDuration: "",
  cfsChildrenApprehesionReason: "",
  kinship: "",
  kinshipExplained: "",
  turnToKinshipCare: "",
  family: [],
  anyConcerns: "",
  casePlanCopy: "",
  casePlanCopyDescribe: "",
  prentativeSupport: "",
  prentativeSupportExplained: "",
  privateAgreement: "",
  privateAgreementExplained: "",
  cfsExplain: "",
  previousInvolvement: "",
  previousInvolvementExplain: "",
  visitsChildFrequency: "",
  parentalCapacityDone: "",
  parentalCapacity: "",
  selectedAdvocate: "",
};

export default preIntakeInitialValues;
