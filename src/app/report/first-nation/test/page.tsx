// This is just for testing

export default function FilterPage({
    searchParams
} : {

    searchParams?: {community?: string; agency?: string; ageGroup?: string};

}) {
    const community = searchParams?.community ?? "";
    const agency = searchParams?.agency ?? "";
    const ageGroup = searchParams?.ageGroup ?? "";

    return (
        <div>
        <p>community: {community || "(not provided)"}</p>
        <p>agency: {agency || "(not provided)"}</p>
        <p>ageGroup: {ageGroup || "(not provided)"}</p>
        </div>
    )
}