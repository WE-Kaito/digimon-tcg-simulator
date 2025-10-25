import { useState } from "react";
import axios from "axios";

type UseQueryReturn<T> = {
    data: T | null;
    isFetching: boolean;
    refetch: () => Promise<void>;
};

export default function useQuery<T>(path: string): UseQueryReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [isFetching, setIsFetching] = useState(false);

    async function fetchData() {
        setIsFetching(true);
        try {
            const response = await axios.get<T>(path);
            if (response.data === "false") setData(false as T);
            else if (response.data === "true") setData(true as T);
            else setData(response.data);
        } catch (error) {
            console.error(`Failed to fetch ${path}:`, error);
        } finally {
            setIsFetching(false);
        }
    }

    useState(() => {
        fetchData();
    });

    return { data, isFetching, refetch: fetchData };
}
