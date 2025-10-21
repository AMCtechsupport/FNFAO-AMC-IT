import supabase from "../../src/app/lib/supabase";
import { useEffect, useState } from "react";

type Filter = {column: string; filter: string}

type PageProps = {
    tableName: string,
    selectColumn?: string[],
    selectQuery?: Filter[],
};

export const DataDisplay: React.FC<PageProps> = ({ 
    tableName, 
    selectColumn = [], 
    selectQuery = []}) => {

    const [fetchError, setFetchError] = useState<string | null>(null)
    const [items, setItems] = useState<string[] | null>(null)
 
    useEffect(() => {
        const fetchItems = async () => {
            const cols = selectColumn.length ? selectColumn.join(',') : "*";

            let query = supabase.from(tableName).select(cols)

            if (selectQuery.length) {
                selectQuery.map((filter) => {
                    query = query.eq(filter.column, filter.filter)
                })
            }

            const { data, error } = await query
            

            if (error) {
                setFetchError('Could not fetch the table')
                setItems(null)
                console.log(error)

            }
            if (data) {
                setItems(data)
                setFetchError(null)
                console.log("working")
            }
        }
    

        fetchItems()
    }, [tableName, selectColumn, selectQuery])

    // Check if items is and array
    if (!Array.isArray(items)) return null;

    return (
        <table className="w-full border border-gray-200 rounded-xl">
            {fetchError && (<p>{fetchError}</p>)}
            <thead className="bg-gray-100">
                <tr>
                    {/* Heading */}
                    {Object.keys(items[0]).map((key) => (
                        <th key={key} className="text-center px-6 py-3 text-gray-700 font-semibold border-b">{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {/* Item Rows */}
                {items.map((item, idx) => (
                    <tr key={idx}>
                        {Object.values(item).map((value, i) => (
                            <td key={i} className="px-6 py-3 border-b text-center">{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )

}

export default DataDisplay;