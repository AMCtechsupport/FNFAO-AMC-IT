import supabase from "../../lib/supabase";

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

        // Gets data from the client
        const { data: clientData, error: clientError } = await supabase
            .from("Clients")
            .select("*")
            .eq("client_id", client_id)
            .maybeSingle();

        if (clientError) {
            console.error("Error fetching client data:", clientError.message || clientError);
        } else {
            setOriginalData(clientData);
                            console.log("🔍 RAW DATABASE DATA (originalData):");
            console.log(JSON.stringify(clientData, null, 2));
            console.log("🔍 SPECIFIC FIELD CHECK - relationshipToChildren:", clientData?.relationshipToChildren);
        }

        // Gets the children associated with the client
        const { data: children, error: childrenError } = await supabase
            .from("Childs")
            .select("*")
            .eq("client_id", client_id);

        if (childrenError) {
            console.error("Error fetching children data:", childrenError.message || childrenError);
        } else {
            // console.log("Children Data:", children);
            setChildrenData(children || []);
        }

        // Gets the family members associated with the client
        const { data: familyData, error: familyError } = await supabase
            .from("Important Family and Friends")
            .select("*")
            .eq("client_id", client_id);

        if (familyError) {
            console.error("Error fetching family data:", familyError.message || familyError);
        } else {
            // console.log("Family Data:", familyData);
            setFamilyData(familyData || []);
        }

        // Gets the home members associated with the client
        const { data: homeMembersData, error: homeMembersError } = await supabase
            .from("Home Members")
            .select("*")
            .eq("client_id", client_id);

        if (homeMembersError) {
            console.error("Error fetching home members data:", homeMembersError.message || homeMembersError);
        } else {
            // console.log("Home members Data:", homeMembersData);
            setHomeMembersData(homeMembersData || []);
        }

        // Gets the EIA workers associated with the client
        const { data: EIAData, error: EIAError } = await supabase
            .from("EIA Workers")
            .select("*")
            .eq("client_id", client_id);

        if (EIAError) {
            console.error("Error fetching EIA data:", EIAError.message || EIAError);
        } else {
            // console.log("EIA Data:", EIAData);
            setEIAData(EIAData || []);
        }

        // Gets the case notes associated with the client
        const {data: notes, error: notesError} = await supabase
            .from("Notes")
            .select("*")
            .eq("client_id", client_id );

        if (notesError){
            console.error("Error fetching notes data:", notesError.message || notesError);
        }else {
            // console.log("Notes Data:", notes);
            setNotesData(notes || []);
        }

        // Separate notes by type
        if (notes) {
            setCaseNotes(notes.filter(note => note.noteType === "Case"));
            setLegalNotes(notes.filter(note => note.noteType === "Legal"));
        }

    setLoading(false);
}