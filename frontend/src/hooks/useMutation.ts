import { useState } from "react";
import axios from "axios";
import { notifyError } from "../utils/toasts.ts";

type Method = "DELETE" | "POST" | "PUT" | "PATCH";

type Options = {
    payload?: any;
    pathVariable?: string;
};

export default function useMutation(path: string, method: Method) {
    const [isPending, setIsPending] = useState(false);

    async function mutate<T>(options?: Options): Promise<T | null> {
        setIsPending(true);
        try {
            const res = await axios({
                method: method,
                url: path + (options?.pathVariable ?? ""),
                data: options?.payload,
            });
            return res.data;
        } catch (error) {
            console.error(error);
            notifyError("Something went wrong!");
            return null;
        } finally {
            setIsPending(false);
        }
    }

    return { isPending, mutate };
}
