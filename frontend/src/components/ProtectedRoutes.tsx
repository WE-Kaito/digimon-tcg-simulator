import {Outlet, Navigate} from "react-router-dom";
import {useGeneralStates} from "../hooks/useGeneralStates.ts";

export default function ProtectedRoutes() {
    const user = useGeneralStates((state) => state.user);

    if (user === "") return "loading ...";

    const isLoggedIn = user !== "anonymousUser";

    return <>{isLoggedIn ? <Outlet/> : <Navigate to="/login"/>}</>;
}
