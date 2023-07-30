import {Outlet, Navigate} from "react-router-dom";

export default function ProtectedRoutes({user}: { user?: string }) {

    if (user === undefined) return "loading ...";

    const isLoggedIn = user !== "";

    return <>{isLoggedIn ? <Outlet/> : <Navigate to="/login"/>}</>;

}
