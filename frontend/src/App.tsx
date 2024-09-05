import './App.css'
import Deckbuilder from "./pages/Deckbuilder.tsx";
import {Navigate, Route, Routes} from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import MainMenu from "./pages/MainMenu.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RecoveryPage from "./pages/RecoveryPage.tsx";
import {useStore} from "./hooks/useStore.ts";
import {useEffect} from "react";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import Lobby from "./pages/Lobby.tsx";
import CustomToastContainer from "./components/CustomToastContainer.tsx";
import GamePage from "./pages/GamePage.tsx";

function App() {

    const me = useStore((state) => state.me);

    useEffect(() => me(), [me]);

    return (
        <>
            <CustomToastContainer/>
                <Routes>
                    <Route element={<ProtectedRoutes/>}>
                        <Route path="/" element={<MainMenu/>}/>
                        <Route path="/profile" element={<Profile/>}/>
                        <Route path="/deckbuilder" element={<Deckbuilder/>}/>
                        <Route path="/update-deck" element={<Deckbuilder isEditMode/>}/>
                        <Route path="/lobby" element={<Lobby/>}/>
                        <Route path="/game" element={<GamePage/>}/>
                        <Route path="/*" element={<Navigate to="/"/>}/>
                    </Route>

                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/recover-password" element={<RecoveryPage/>}/>
                </Routes>
        </>
    )
}

export default App
