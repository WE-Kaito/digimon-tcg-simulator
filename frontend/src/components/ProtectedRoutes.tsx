import {Outlet, Navigate} from "react-router-dom";

export default function ProtectedRoutes({user}: { user?: string }) {

    if (user === "") return "loading ...";

    const isLoggedIn = user !== "anonymousUser";

    return <>{isLoggedIn ? <Outlet/> : <Navigate to="/login"/>}</>;

}
