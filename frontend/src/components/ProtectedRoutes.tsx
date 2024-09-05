import {Outlet, Navigate} from "react-router-dom";
import {useStore} from "../hooks/useStore.ts";

export default function ProtectedRoutes() {
    const user = useStore((state) => state.user);

    if (user === "") return "loading ...";

    const isLoggedIn = user !== "anonymousUser";

    return <>{isLoggedIn ? <Outlet/> : <Navigate to="/login"/>}</>;
}
