'use client'

import UserHome from "../user-home/page"
import supabase from "../lib/supabase";
import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState} from 'react'


export default function ReportPage() {

    const [fetchError, setFetchError] = useState<string | null>(null)
    const [advocates, setAdvocates] = useState<any[] | null>(null)

    useEffect(() => {

        const fetchAdvocates = async () => {
            const {data, error} = await supabase
            .from("Advocates")
            .select()

            if (error) {
                setFetchError('Could not fetch the smoothies')
                setAdvocates(null)
                console.log(error)
            }
            if (data) {
                setAdvocates(data)
                setFetchError(null)
            }
        }

        
        fetchAdvocates()
    }, [])

    return (
        <UserHome>
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* This is the main heading */}
                    <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Data</h1>

                {/* These are the data for the report page */}
                {fetchError && (<p>{fetchError}</p>)}
                {advocates && (
                    <div className="advocates">
                        {Object.keys(advocates[0]).map((key) => (
                            <p key={key}>{key}</p>
                        ))}
                        <div>
                            {advocates.map((advocate) => (
                                <div>
                                    {advocate.firstName}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                    
                </div>
            </div>
        </UserHome>
    );
}