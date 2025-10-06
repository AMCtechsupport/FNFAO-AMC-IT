import supabase from "../supabase";

export async function FetchAdvocate() {
    try {
        const {data: advocatesData, error: advocatesError} = await supabase
        .from("Advocates")
        .select("*");

        if (advocatesError) {
            throw new Error(advocatesError?.message);
        }

        return {advocatesData };
    } catch (err) {
        throw new Error("Error fetching data: " + err.message);
    }

}