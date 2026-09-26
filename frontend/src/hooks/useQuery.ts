import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

type UseQueryReturn<T> = {
    data: T | null;
    isFetching: boolean;
    refetch: () => Promise<void>;
};

export default function useQuery<T>(path: string): UseQueryReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const isMounted = useRef(false);

    const fetchData = useCallback(async (signal?: AbortSignal) => {
        if (isMounted.current) setIsFetching(true);
        try {
            const response = await axios.get<T>(path, { signal });
            if (signal?.aborted || !isMounted.current) return;
            if (response.data === "false") setData(false as T);
            else if (response.data === "true") setData(true as T);
            else setData(response.data);
        } catch (error) {
            if (signal?.aborted || !isMounted.current) return;
            console.error(`Failed to fetch ${path}:`, error);
        } finally {
            if (!signal?.aborted && isMounted.current) setIsFetching(false);
        }
    }, [path]);

    useEffect(() => {
        const controller = new AbortController();
        isMounted.current = true;
        void fetchData(controller.signal);
        return () => {
            isMounted.current = false;
            controller.abort();
        };
    }, [fetchData]);

    return { data, isFetching, refetch: () => fetchData() };
}
