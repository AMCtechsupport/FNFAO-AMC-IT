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
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">{name}</h2>
                        <p className="text-gray-600 mb-4">
                            {description}
                        </p>
                        <Link href={`/${path}`}>
                            <button
                                onClick={OnClickHandler}
                                type="button"
                                disabled={isLoading}
                                className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
                            >
                                {isLoading ? `Loading...` : {name}.name}
                            </button>
                        </Link>
                    </div>
    )
}