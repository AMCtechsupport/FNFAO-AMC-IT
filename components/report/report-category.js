/*
This component displays a report category card,
with a name, description, and a button
that navigates to a detailed report page.
*/

import Link from "next/link"
import {useState} from "react"


export default function ReportCategory({name, description, path}) {
    const [isLoading, setIsLoading] = useState(false)

    function OnClickHandler() {
        setIsLoading(!isLoading)
    }
    
    return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 text-white text-xs font-semibold uppercase tracking-wider" style={{ backgroundColor: "#47315E" }}>
                        {name}
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-gray-500 mb-4">{description}</p>
                        <Link href={`/${path}`}>
                            <button
                                onClick={OnClickHandler}
                                type="button"
                                disabled={isLoading}
                                className="w-full py-2.5 text-sm font-medium rounded-lg transition-colors border disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: "#B2B3D7", borderColor: "#9899C0", color: "#47315E" }}
                                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = "#9899C0"; }}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#B2B3D7"}
                            >
                                {isLoading ? `Loading...` : {name}.name}
                            </button>
                        </Link>
                    </div>
                </div>
    )
}