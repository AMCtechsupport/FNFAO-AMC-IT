import supabase from "@/app/lib/supabase";
import { useEffect, useState } from "react";

type PageProps = {
    tableName: string,
    selectColumn: string,
};

export const DataColumn: React.FC<PageProps> = ({
    tableName, 
    selectColumn
}) => {

    const [fetchError, setFetchError] = useState<string | null>(null)
    const [items, setItems] = useState<string[] | null>(null)

    useEffect(() => {
        const fetchItems = async () => {

            
            const { data, error } = await supabase
            .from(tableName)
            .select(selectColumn)
            .order(selectColumn ?? '', {ascending: true})

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
        fetchItems();

    },[tableName, selectColumn])

    if (!Array.isArray(items)) return <div>{fetchError}</div>;

    return (
        <>
        {items.map((item, idx) => (
                <tr key={idx}>
                    {Object.values(item).map((value, i) => (
                        <td key={i} >{value}</td>
                    ))}
                </tr>
            ))}
        </>
    )

}

export default DataColumn;