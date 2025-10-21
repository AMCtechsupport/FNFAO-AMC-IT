import supabase from "@/app/lib/supabase";
import { useEffect, useState } from "react";

export default function DataColumn(tableName, selectColumn) {

    const [fetchError, setFetchError] = useState(null)
    const [items, setItems] = useState([])

    useEffect(() => {
        if (!tableName || !selectColumn) {
            setItems([]);
            setFetchError(null);
            return;
        }
        
        // Fetch column from table
        const fetchItems = async () => {
            const { data, error } = await supabase
            .from(tableName)
            .select(selectColumn)
            .order(selectColumn ?? '', {ascending: true})

            if (error) {
                setFetchError('Could not fetch the table')
                setItems([])
            }
            if (data) {
                setItems(data ?? [])
                setFetchError(null)
            }
            setLoading(false);

        }
        fetchItems();

    },[tableName, selectColumn])

    if (!Array.isArray(items)) 
        return fetchError

    // Only take in unique values
    const columnData = Array.from(
        new Set(
            items.flatMap(items => Object.values(items))
        )
    );

    return columnData
}