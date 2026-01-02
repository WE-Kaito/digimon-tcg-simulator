import "./App.css";
import { useGeneralStates } from "./hooks/useGeneralStates.ts";
import { useEffect } from "react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useDeckStates } from "./hooks/useDeckStates.ts";
// import { Navigate, Route, Routes } from "react-router-dom";
// import Profile from "./pages/Profile.tsx";
// import LoginPage from "./pages/LoginPage.tsx";
// import RecoveryPage from "./pages/RecoveryPage.tsx";
// import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
// import Lobby from "./pages/Lobby.tsx";
// import CustomToastContainer from "./components/CustomToastContainer.tsx";
// import GamePage from "./pages/GamePage.tsx";
// import Decks from "./pages/Decks.tsx";
// import Deckbuilder from "./pages/Deckbuilder.tsx";
// import DeckTest from "./pages/DeckTest.tsx";
// import Administration from "./pages/Administration.tsx";

function App() {
    const me = useGeneralStates((state) => state.me);
    const user = useGeneralStates((state) => state.user);
    const fetchCards = useDeckStates((state) => state.fetchCards);
    const fetchDecks = useDeckStates((state) => state.fetchDecks);
    const setParticlesInitialized = useGeneralStates((state) => state.setParticlesInitialized);

    useEffect(() => me(), [me]);

    useEffect(() => fetchCards(), [fetchCards]);

    useEffect(() => {
        if (user.length && user !== "anonymousUser") fetchDecks();
    }, [fetchDecks, user]);

    useEffect(() => {
        initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setParticlesInitialized(true));
    }, [setParticlesInitialized]);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "32px",
                    height: "100vh",
                }}
            >
                {"Currently under maintenance. Please check back later."}
            </div>
            {/*<CustomToastContainer />*/}
            {/*<Routes>*/}
            {/*    <Route element={<ProtectedRoutes />}>*/}
            {/*        <Route path="/" element={<Lobby />} />*/}
            {/*        <Route path="/profile" element={<Profile />} />*/}
            {/*        <Route path="/decks" element={<Decks />} />*/}
            {/*        <Route path="/deckbuilder" element={<Deckbuilder />} />*/}
            {/*        <Route path="/deckbuilder/:id" element={<Deckbuilder />} />*/}
            {/*        <Route path="/game" element={<GamePage />} />*/}
            {/*        <Route path="/test" element={<DeckTest />} />*/}
            {/*        <Route path="/administration" element={<Administration />} />*/}
            {/*        <Route path="/*" element={<Navigate to="/" />} />*/}
            {/*    </Route>*/}

            {/*    <Route path="/login" element={<LoginPage />} />*/}
            {/*    <Route path="/recover-password" element={<RecoveryPage />} />*/}
            {/*</Routes>*/}
        </>
    );
}

export default App;
