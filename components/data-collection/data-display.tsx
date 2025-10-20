import supabase from "../../src/app/lib/supabase";
import { useEffect, useState } from "react";

type PageProps = {
    tableName: string,
    selectColumn?: string[],
    selectTable?: string[],
    selectQuery?: string[],
};

export const DataDisplay:React.FC<PageProps> = ({ tableName, selectColumn = [], selectQuery = []}) => {
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [items, setItems] = useState<string[]| null>(null)
 
    useEffect(() => {

        const fetchItems = async () => {
            const cols = selectColumn.length ? selectColumn.join(',') : "*";
            const { data, error } = await supabase
            .from(`${tableName}`)
            .select(cols)
            .eq(selectQuery[0], selectQuery[0])



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
        <table>
            {fetchError && (<p>{fetchError}</p>)}
            <thead>
                <tr>
                    {/* Heading */}
                    {Object.keys(items[0]).map((key) => (
                        <th key={key}>{key}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {/* Item Rows */}
                {items.map((item, idx) => (
                    <tr key={idx}>
                        {Object.values(item).map((value, i) => (
                            <td key={i}>{value}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )

}

export default DataDisplay;