import "./App.css";
import Deckbuilder from "./pages/Deckbuilder.tsx";
import { Navigate, Route, Routes } from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RecoveryPage from "./pages/RecoveryPage.tsx";
import { useGeneralStates } from "./hooks/useGeneralStates.ts";
import { useEffect } from "react";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import Lobby from "./pages/Lobby.tsx";
import CustomToastContainer from "./components/CustomToastContainer.tsx";
import GamePage from "./pages/GamePage.tsx";
import MainMenu from "./pages/MainMenu.tsx";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

function App() {
    const me = useGeneralStates((state) => state.me);
    const fetchCards = useGeneralStates((state) => state.fetchCards);
    const setParticlesInitialized = useGeneralStates((state) => state.setParticlesInitialized);

    useEffect(() => me(), [me]);
    useEffect(() => fetchCards(), [fetchCards]);
    useEffect(() => {
        initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setParticlesInitialized(true));
    }, [setParticlesInitialized]);

    return (
        <>
            <CustomToastContainer />
            <Routes>
                <Route element={<ProtectedRoutes />}>
                    <Route path="/" element={<MainMenu />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/deckbuilder" element={<Deckbuilder />} />
                    <Route path="/update-deck" element={<Deckbuilder isEditMode />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/game" element={<GamePage />} />
                    <Route path="/*" element={<Navigate to="/" />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/recover-password" element={<RecoveryPage />} />
            </Routes>
        </>
    );
}

export default App;
