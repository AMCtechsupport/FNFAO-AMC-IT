// This is just for testing and will be deleted after a proper page is put here

import { Suspense } from "react";
import AgeSelectionFilter from "../../../../../components/report/age-selection-filter";
// Keep code though **

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
        <Suspense fallback={<div className="p-6 text-center">Loading filters...</div>}>
        <AgeSelectionFilter />
        </Suspense>
        </div>
    )
}