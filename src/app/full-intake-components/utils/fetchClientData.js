import supabase from "../../lib/supabase";

export const normalizeDates = (data) => {
  if (!data) return data;
  const result = { ...data };
  Object.keys(result).forEach((key) => {
    const val = result[key];
    if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
      result[key] = val.slice(0, 10);
    }
  });
  return result;
};

export async function fetchClientData({
  client_id,
  setLoading,
  setOriginalData,
  setChildrenData,
  setFamilyData,
  setHomeMembersData,
  setEIAData,
  setNotesData,
  setCaseNotes,
  setLegalNotes,
}) {
  setLoading(true);

  // Client
  const { data: clientData, error: clientError } = await supabase
    .from("Clients")
    .select("*")
    .eq("client_id", client_id)
    .maybeSingle();

  if (clientError) {
    console.error("Error fetching client data:", clientError.message || clientError);
  } else {
    setOriginalData(normalizeDates(clientData));
  }

  // Children
  const { data: children, error: childrenError } = await supabase
    .from("Childs")
    .select("*")
    .eq("client_id", client_id);

  if (childrenError) {
    console.error("Error fetching children data:", childrenError.message || childrenError);
  } else {
    setChildrenData(children || []);
  }

  // Family
  const { data: familyData, error: familyError } = await supabase
    .from("Important Family and Friends")
    .select("*")
    .eq("client_id", client_id);

  if (familyError) {
    console.error("Error fetching family data:", familyError.message || familyError);
  } else {
    setFamilyData(familyData || []);
  }

  // Home Members
  const { data: homeMembersData, error: homeMembersError } = await supabase
    .from("Home Members")
    .select("*")
    .eq("client_id", client_id);

  if (homeMembersError) {
    console.error("Error fetching home members data:", homeMembersError.message || homeMembersError);
  } else {
    setHomeMembersData(homeMembersData || []);
  }

  // EIA
  const { data: EIAData, error: EIAError } = await supabase
    .from("EIA Workers")
    .select("*")
    .eq("client_id", client_id);

  if (EIAError) {
    console.error("Error fetching EIA data:", EIAError.message || EIAError);
  } else {
    setEIAData(EIAData || []);
  }

  // Notes
  const { data: notes, error: notesError } = await supabase
    .from("Notes")
    .select("*")
    .eq("client_id", client_id)
    .order("note_id", { ascending: true });

  if (notesError) {
    console.error("Error fetching notes data:", notesError.message || notesError);
    setNotesData([]);
    setCaseNotes([]);
    setLegalNotes([]);
  } else {
    const safeNotes = notes || [];
    setNotesData(safeNotes);

    // Normalize noteType comparisons (Case/Legal)
    const caseNotes = safeNotes.filter((n) => String(n.noteType || "").toLowerCase() === "case");
    const legalNotes = safeNotes.filter((n) => String(n.noteType || "").toLowerCase() === "legal");

    setCaseNotes(caseNotes);
    setLegalNotes(legalNotes);
  }

  setLoading(false);
}
